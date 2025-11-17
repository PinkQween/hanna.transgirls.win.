// Canvas-based terminal using Rust WASM backend
export class RustCanvasTerminal {
    constructor(canvas) {
        console.log('RustCanvasTerminal constructor called', canvas);
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lines = [];
        this.currentLine = '';
        this.cursorX = 0;
        this.historyIndex = -1;
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
        this.padding = 10;
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
        } else if (output) {
            const outputLines = output.split('\n');
            outputLines.forEach(line => this.print(line));
        }
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

        while (this.lines.length > this.maxLines) {
            this.lines.shift();
        }

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
        this.render();
    }

    setupInput() {
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });

        this.canvas.tabIndex = 0;

        this.canvas.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const lastLine = this.lines[this.lines.length - 1];
                const promptLength = this.wasmTerminal ? this.wasmTerminal.getPrompt().length : 2;
                const input = lastLine.substring(promptLength);
                this.executeCommand(input);
                this.newPrompt();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                const promptLength = this.wasmTerminal ? this.wasmTerminal.getPrompt().length : 2;
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

        // Render lines
        this.ctx.fillStyle = '#f0f';
        this.ctx.font = `${this.fontSize}px 'Courier New', monospace`;

        this.lines.forEach((line, index) => {
            const y = this.padding + index * this.lineHeight;
            this.ctx.fillText(line, this.padding, y);
        });

        // Render cursor
        const lastLine = this.lines[this.lines.length - 1] || '';
        const cursorY = this.padding + (this.lines.length - 1) * this.lineHeight;
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
