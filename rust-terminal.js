// Canvas-based terminal using Rust WASM backend
//
// Supported keyboard shortcuts:
// - Ctrl/Cmd + L: Clear screen
// - Ctrl/Cmd + A: Move cursor to start of line
// - Ctrl/Cmd + E: Move cursor to end of line
// - Ctrl/Cmd + U: Clear line before cursor
// - Ctrl/Cmd + K: Clear line after cursor
// - Ctrl/Cmd + W: Delete word before cursor
// - Ctrl/Cmd + C: Cancel current line
// - Arrow Up/Down: Navigate command history
// - Page Up/Down: Scroll through terminal output
// - Mouse Wheel: Scroll through terminal output
// - Ctrl/Cmd + V: Paste text
//
export class RustCanvasTerminal {
    constructor(canvas) {
        console.log('RustCanvasTerminal constructor called', canvas);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lines = [];
        this.currentLine = '';
        this.cursorX = 0;
        this.historyIndex = -1;
        this.scrollOffset = 0;
        this.wasmTerminal = null;

        this.setupCanvas();
        this.loadWasm();
    }

    async loadWasm() {
        try {
            console.log('Loading WASM module...');
            const wasm = await import('./wasm-terminal/pkg/wasm_terminal.js');
            await wasm.default();

            console.log('Creating RustTerminal instance...');
            this.wasmTerminal = new wasm.RustTerminal();

            this.wasmTerminal.setUserPassword("skairipa", "936d04ec3da8478e72828e63e558cd8f12418becae504669fb878f571ee75d61");

            this.wasmTerminal.setUserPassword("root", "8f3e9a2c1b5d7f4e6a8c3b9d2f5e7a1c4d8b6e3f9a2c5d7e4b1f8a6c3e9d2b5f7");

            // Display login prompt
            this.print('Welcome to Hanna\'s Terminal System v1.0');
            this.print('');
            this.newPrompt();
            this.setupInput();
            this.renderLoop();

            console.log('WASM terminal initialized successfully');
        } catch (error) {
            console.error('Failed to load WASM:', error);
            this.print('ERROR: Failed to load terminal WASM module');
        }
    }

    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        console.log('Canvas rect:', rect);

        if (rect.width === 0 || rect.height === 0) {
            console.warn('Canvas has no dimensions, using defaults');
            this.canvas.width = 800 * dpr;
            this.canvas.height = 450 * dpr;
            this.ctx.scale(dpr, dpr);
        } else {
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
        }

        this.fontSize = 14;
        this.lineHeight = 20;
        this.padding = 30;
        this.maxLines = Math.floor((this.canvas.height / dpr - this.padding * 2) / this.lineHeight);

        console.log('Canvas setup:', {
            width: this.canvas.width,
            height: this.canvas.height,
            maxLines: this.maxLines
        });

        this.ctx.font = `${this.fontSize}px 'Courier New', monospace`;
        this.ctx.textBaseline = 'top';
    }

    executeCommand(input) {
        if (!this.wasmTerminal) {
            this.print('Terminal not ready yet...');
            return;
        }

        const output = this.wasmTerminal.executeCommand(input);

        // Handle special authentication responses
        if (output === 'USERNAME_OK') {
            // Username accepted, ask for password
            this.newPrompt();
            return;
        } else if (output.startsWith('LOGIN_SUCCESS:')) {
            const username = output.split(':')[1];
            this.print('');
            this.print(`Welcome, ${username}!`);
            this.print('');
            // Show welcome message based on user
            if (username === 'skairipa') {
                const welcomeFile = this.wasmTerminal.readFile('/home/skairipa/welcome.txt');
                if (welcomeFile) {
                    welcomeFile.split('\n').forEach(line => this.print(line));
                }
            } else if (username === 'root') {
                this.print('Welcome, System Administrator!');
                this.print('You have full system access.');
            }
            this.print('');
            this.newPrompt();
            return;
        } else if (output.startsWith('LOGIN_FAILED:')) {
            const error = output.split(':')[1];
            this.print(`Login failed: ${error}`);
            this.print('');
            this.newPrompt();
            return;
        } else if (output === 'LOGOUT') {
            this.print('Logging out...');
            this.print('');
            this.newPrompt();
            return;
        } else if (output === 'CLEAR') {
            this.lines = [];
            this.newPrompt();
            return;
        } else if (output) {
            const outputLines = output.split('\n');
            outputLines.forEach(line => this.print(line));
        }
        // Add new prompt after command execution
        this.newPrompt();
    }

    print(text) {
        const rect = this.canvas.getBoundingClientRect();
        const maxCharsPerLine = Math.floor((rect.width - this.padding * 2) / (this.fontSize * 0.6));

        const words = text.split(' ');
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            if (testLine.length > maxCharsPerLine && currentLine) {
                this.lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }

        if (currentLine) {
            this.lines.push(currentLine);
        }

        // Auto-scroll to bottom when new content is added
        this.scrollOffset = Math.max(0, this.lines.length - this.maxLines);

        this.render();
    }

    newPrompt() {
        if (this.wasmTerminal) {
            const prompt = this.wasmTerminal.getPrompt();
            this.lines.push(prompt);
            this.cursorX = prompt.length;
        } else {
            this.lines.push('$ ');
            this.cursorX = 2;
        }

        // Auto-scroll to bottom when new prompt is added
        this.scrollOffset = Math.max(0, this.lines.length - this.maxLines);

        this.render();
    }

    setupInput() {
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });

        this.canvas.tabIndex = 0;

        // Add paste event listener
        this.canvas.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedText = e.clipboardData.getData('text');
            // Add pasted text to current line
            if (pastedText) {
                // Filter out newlines and control characters
                const sanitized = pastedText.replace(/[\r\n]/g, '');
                this.lines[this.lines.length - 1] += sanitized;
                this.cursorX += sanitized.length;
                this.render();
            }
        });

        // Add wheel event listener for scrolling
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = Math.sign(e.deltaY);
            const maxScroll = Math.max(0, this.lines.length - this.maxLines);

            this.scrollOffset = Math.max(0, Math.min(maxScroll, this.scrollOffset + delta));
            this.render();
        });

        this.canvas.addEventListener('keydown', (e) => {
            const isCtrl = e.ctrlKey || e.metaKey; // Support both Ctrl (Windows/Linux) and Cmd (Mac)
            const promptLength = this.wasmTerminal ? this.wasmTerminal.getPrompt().length : 2;

            // Ctrl+L or Cmd+L: Clear screen
            if (isCtrl && e.key === 'l') {
                e.preventDefault();
                this.lines = [];
                this.scrollOffset = 0;
                this.newPrompt();
                return;
            }

            // Ctrl+C or Cmd+C: Cancel current line (if there's input)
            if (isCtrl && e.key === 'c') {
                const lastLine = this.lines[this.lines.length - 1];
                const currentInput = lastLine.substring(promptLength);

                if (currentInput.length > 0) {
                    e.preventDefault();
                    this.lines[this.lines.length - 1] += '^C';
                    this.print('');
                    this.newPrompt();
                    this.historyIndex = -1;
                    return;
                }
            }

            // Ctrl+A or Cmd+A: Move cursor to start of line
            if (isCtrl && e.key === 'a') {
                e.preventDefault();
                this.cursorX = promptLength;
                this.render();
                return;
            }

            // Ctrl+E or Cmd+E: Move cursor to end of line
            if (isCtrl && e.key === 'e') {
                e.preventDefault();
                this.cursorX = this.lines[this.lines.length - 1].length;
                this.render();
                return;
            }

            // Ctrl+U or Cmd+U: Clear line before cursor
            if (isCtrl && e.key === 'u') {
                e.preventDefault();
                const lastLine = this.lines[this.lines.length - 1];
                const prompt = lastLine.substring(0, promptLength);
                const afterCursor = lastLine.substring(this.cursorX);
                this.lines[this.lines.length - 1] = prompt + afterCursor;
                this.cursorX = promptLength;
                this.render();
                return;
            }

            // Ctrl+K or Cmd+K: Clear line after cursor
            if (isCtrl && e.key === 'k') {
                e.preventDefault();
                const lastLine = this.lines[this.lines.length - 1];
                this.lines[this.lines.length - 1] = lastLine.substring(0, this.cursorX);
                this.render();
                return;
            }

            // Ctrl+W or Cmd+W: Delete word before cursor
            if (isCtrl && e.key === 'w') {
                e.preventDefault();
                const lastLine = this.lines[this.lines.length - 1];
                const beforeCursor = lastLine.substring(0, this.cursorX);
                const afterCursor = lastLine.substring(this.cursorX);

                // Find the last word boundary
                const promptText = beforeCursor.substring(0, promptLength);
                const userInput = beforeCursor.substring(promptLength);
                const trimmed = userInput.trimEnd();
                const lastSpaceIndex = trimmed.lastIndexOf(' ');

                let newBeforeCursor;
                if (lastSpaceIndex === -1) {
                    // No space found, delete everything
                    newBeforeCursor = promptText;
                } else {
                    // Delete from last space
                    newBeforeCursor = promptText + trimmed.substring(0, lastSpaceIndex + 1);
                }

                this.lines[this.lines.length - 1] = newBeforeCursor + afterCursor;
                this.cursorX = newBeforeCursor.length;
                this.render();
                return;
            }

            // Page Up: Scroll up
            if (e.key === 'PageUp') {
                e.preventDefault();
                const maxScroll = Math.max(0, this.lines.length - this.maxLines);
                this.scrollOffset = Math.max(0, this.scrollOffset - 5);
                this.render();
                return;
            }

            // Page Down: Scroll down
            if (e.key === 'PageDown') {
                e.preventDefault();
                const maxScroll = Math.max(0, this.lines.length - this.maxLines);
                this.scrollOffset = Math.min(maxScroll, this.scrollOffset + 5);
                this.render();
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                const lastLine = this.lines[this.lines.length - 1];
                const input = lastLine.substring(promptLength);
                this.executeCommand(input);
                // Reset history index when command is executed
                this.historyIndex = -1;
                // Reset scroll to bottom
                this.scrollOffset = Math.max(0, this.lines.length - this.maxLines);
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                if (this.cursorX > promptLength) {
                    const lastLine = this.lines[this.lines.length - 1];
                    this.lines[this.lines.length - 1] = lastLine.slice(0, -1);
                    this.cursorX--;
                    this.render();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.wasmTerminal) {
                    const historyLen = this.wasmTerminal.getHistoryLength();
                    if (this.historyIndex === -1) {
                        this.historyIndex = historyLen - 1;
                    } else if (this.historyIndex > 0) {
                        this.historyIndex--;
                    }

                    if (this.historyIndex >= 0) {
                        const historyItem = this.wasmTerminal.getHistoryItem(this.historyIndex);
                        if (historyItem) {
                            const prompt = this.wasmTerminal.getPrompt();
                            this.lines[this.lines.length - 1] = prompt + historyItem;
                            this.cursorX = this.lines[this.lines.length - 1].length;
                            this.render();
                        }
                    }
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.wasmTerminal) {
                    const historyLen = this.wasmTerminal.getHistoryLength();
                    if (this.historyIndex < historyLen - 1 && this.historyIndex !== -1) {
                        this.historyIndex++;
                        const historyItem = this.wasmTerminal.getHistoryItem(this.historyIndex);
                        if (historyItem) {
                            const prompt = this.wasmTerminal.getPrompt();
                            this.lines[this.lines.length - 1] = prompt + historyItem;
                            this.cursorX = this.lines[this.lines.length - 1].length;
                            this.render();
                        }
                    } else {
                        this.historyIndex = -1;
                        const prompt = this.wasmTerminal.getPrompt();
                        this.lines[this.lines.length - 1] = prompt;
                        this.cursorX = prompt.length;
                        this.render();
                    }
                }
            } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                this.lines[this.lines.length - 1] += e.key;
                this.cursorX++;
                this.render();
            }
        });
    }

    render() {
        const rect = this.canvas.getBoundingClientRect();

        // Clear canvas
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, rect.width, rect.height);

        // Render lines with scroll support
        this.ctx.fillStyle = '#f0f';
        this.ctx.font = `${this.fontSize}px 'Courier New', monospace`;

        // Calculate which lines to show based on scroll offset
        const startLine = this.scrollOffset;
        const endLine = Math.min(this.lines.length, startLine + this.maxLines);

        for (let i = startLine; i < endLine; i++) {
            const line = this.lines[i];
            const y = this.padding + (i - startLine) * this.lineHeight;
            this.ctx.fillText(line, this.padding, y);
        }

        // Render cursor (only if current line is visible)
        const lastLineIndex = this.lines.length - 1;
        if (lastLineIndex >= startLine && lastLineIndex < endLine) {
            const lastLine = this.lines[lastLineIndex] || '';
            const cursorY = this.padding + (lastLineIndex - startLine) * this.lineHeight;
            const cursorTextWidth = this.ctx.measureText(lastLine).width;

            // Blinking cursor
            const now = Date.now();
            if (Math.floor(now / 500) % 2 === 0) {
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(
                    this.padding + cursorTextWidth,
                    cursorY,
                    2,
                    this.fontSize
                );
            }
        }

        // Render scroll indicator if there are more lines than visible
        if (this.lines.length > this.maxLines) {
            const scrollPercentage = this.scrollOffset / Math.max(1, this.lines.length - this.maxLines);
            const indicatorHeight = 20;
            const indicatorY = this.padding + scrollPercentage * (rect.height - this.padding * 2 - indicatorHeight);

            this.ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
            this.ctx.fillRect(rect.width - 10, indicatorY, 5, indicatorHeight);
        }
    }

    renderLoop() {
        this.render();
        requestAnimationFrame(() => this.renderLoop());
    }

    // Public API for adding files from JavaScript
    async addFile(path, content) {
        if (this.wasmTerminal) {
            try {
                await this.wasmTerminal.addFile(path, content);
                console.log(`File added: ${path}`);
            } catch (error) {
                console.error(`Failed to add file ${path}:`, error);
            }
        }
    }

    async addDirectory(path) {
        if (this.wasmTerminal) {
            try {
                await this.wasmTerminal.addDirectory(path);
                console.log(`Directory added: ${path}`);
            } catch (error) {
                console.error(`Failed to add directory ${path}:`, error);
            }
        }
    }
}
