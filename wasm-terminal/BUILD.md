# WASM Terminal Build Instructions

## Quick Start

The easiest way to build the terminal is using the included build script:

```bash
./build.sh
```

This script will:
- Check for required tools (Rust, cargo, wasm-pack)
- Install missing dependencies
- Build the WASM module
- Generate JavaScript bindings

## Manual Build Instructions

### Prerequisites

1. Install Rust and rustup:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Add the WASM target:
```bash
rustup target add wasm32-unknown-unknown
```

3. Install wasm-pack (recommended):
```bash
cargo install wasm-pack
```

### Building with wasm-pack (Recommended)

```bash
cd wasm-terminal
wasm-pack build --target web --out-dir pkg
```

This automatically generates optimized WASM and JavaScript bindings in `wasm-terminal/pkg/`.

### Building with cargo (Manual)

1. Build the WASM module:
```bash
cd wasm-terminal
cargo build --target wasm32-unknown-unknown --release
```

2. Generate JavaScript bindings:
```bash
wasm-bindgen target/wasm32-unknown-unknown/release/wasm_terminal.wasm \
  --out-dir pkg \
  --target web
```

## Using in the Project

After building, the WASM module will be in `wasm-terminal/pkg/`.

Import it in your JavaScript:
```javascript
import init, { RustTerminal } from './wasm-terminal/pkg/wasm_terminal.js';

// Initialize WASM module
await init();

// Create terminal instance
const terminal = new RustTerminal();

// Execute commands
const output = terminal.executeCommand("ls");
console.log(output);

// Get current prompt
const prompt = terminal.getPrompt();
console.log(prompt);

// Add files to the virtual filesystem
terminal.addFile("/home/skairipa/test.txt", "Hello World!");
```

## Features

The Rust WASM Terminal includes:

- **Virtual Filesystem**: Complete file system with directories and files
- **Working Directory**: Navigate with `cd`, `pwd`
- **User Management**: Switch between users with `su`, use `sudo` for elevated privileges
- **File Operations**: `ls`, `cat`, `mkdir`, `touch`, `tree`
- **Shell Commands**: `echo`, `clear`, `env`, `whoami`, `date`, `neofetch`
- **Command History**: Arrow keys to navigate through previous commands

## File System Structure

```
/
├── home/
│   └── skairipa/
│       ├── README.md
│       └── about.txt
└── root/
    └── .bashrc
```

## Users

- **hanna** - Default user (prompt: `hanna:/path/to/dir $`)
- **root** - System administrator (prompt: `root:/path/to/dir #`)

Use `su` to switch users:
```bash
su root       # Switch to root
su hanna      # Switch back to hanna
```

Use `sudo` to execute commands as root:
```bash
sudo mkdir /etc
sudo touch /root/system.conf
```

## Troubleshooting

### Error: `wasm32-unknown-unknown` target not installed

Run:
```bash
rustup target add wasm32-unknown-unknown
```

### Error: wasm-pack not found

Install wasm-pack:
```bash
cargo install wasm-pack
```

### Build fails with "can't find crate for `core`"

Make sure you have the wasm32 target installed:
```bash
rustup target add wasm32-unknown-unknown
```

## Development

To run tests:
```bash
cd wasm-terminal
cargo test
```

To check the code:
```bash
cd wasm-terminal
cargo check --target wasm32-unknown-unknown
```
