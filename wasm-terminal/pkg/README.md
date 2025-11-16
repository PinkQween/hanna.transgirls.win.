# WASM Terminal Emulator

A lightweight terminal emulator written in Rust and compiled to WebAssembly.

## Features

- ✅ Character-by-character writing
- ✅ Line buffering with history
- ✅ Cursor management
- ✅ Backspace support
- ✅ Automatic scrolling
- ✅ Resizable terminal
- ✅ Newline handling
- ✅ Full terminal buffer access

## API

### Constructor
```javascript
const term = new WasmTerminal(width, height);
await term.init();
```

### Methods

- `write(text: string)` - Write a string to the terminal
- `writeChar(char: string)` - Write a single character
- `clear()` - Clear the terminal buffer
- `getBuffer()` - Get the entire terminal buffer as a string
- `getLine(y: number)` - Get a specific line
- `getCursorX()` - Get cursor X position
- `getCursorY()` - Get cursor Y position
- `getCurrentLine()` - Get the current line being edited
- `getHistory()` - Get command history
- `resize(width, height)` - Resize the terminal

## Example Usage

```javascript
import { WasmTerminal, createTerminal } from './terminal.js';

// Simple usage
const term = new WasmTerminal(80, 24);
await term.init();

term.write("$ ");
term.onOutput = (buffer) => {
    console.log(buffer);
};

// Full example with DOM integration
const container = document.getElementById('terminal-container');
const term = await createTerminal(container, 80, 24);
term.write("Welcome to WASM Terminal!\n");
term.write("$ ");
```

## Performance

The terminal is optimized for:
- Minimal memory footprint
- Fast character operations
- Efficient scrolling
- WASM size optimization (< 50KB gzipped)

## Tests

Run tests with:
```bash
cargo test
```

## License

MIT
