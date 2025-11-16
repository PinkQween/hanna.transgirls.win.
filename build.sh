#!/bin/bash

# build.sh - Build script for Rust WASM Terminal

set -e  # Exit on error

echo "======================================"
echo "Building Rust WASM Terminal"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
echo "Checking prerequisites..."

if ! command -v cargo &> /dev/null; then
    echo -e "${RED}Error: cargo is not installed${NC}"
    echo "Please install Rust from https://rustup.rs/"
    exit 1
fi

if ! command -v wasm-pack &> /dev/null; then
    echo -e "${YELLOW}Warning: wasm-pack is not installed${NC}"
    echo "Installing wasm-pack..."
    cargo install wasm-pack
fi

# Check if wasm32-unknown-unknown target is installed
echo "Checking for wasm32-unknown-unknown target..."
if ! rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
    echo -e "${YELLOW}Installing wasm32-unknown-unknown target...${NC}"
    rustup target add wasm32-unknown-unknown
fi

echo -e "${GREEN}✓ All prerequisites satisfied${NC}"
echo ""

# Navigate to wasm-terminal directory
cd wasm-terminal

cargo build --target wasm32-unknown-unknown --release

wasm-bindgen target/wasm32-unknown-unknown/release/wasm_terminal.wasm \
  --out-dir pkg \
  --target web

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ WASM build successful!${NC}"
else
    echo -e "${RED}✗ WASM build failed${NC}"
    exit 1
fi

echo ""
echo "======================================"
echo "Build complete!"
echo "======================================"
echo ""
echo "The WASM module is now available at:"
echo "  wasm-terminal/pkg/wasm_terminal.js"
echo "  wasm-terminal/pkg/wasm_terminal_bg.wasm"
echo ""
echo "To use the terminal, include it in your web page:"
echo "  import init, { RustTerminal } from './wasm-terminal/pkg/wasm_terminal.js';"
echo "  await init();"
echo "  const terminal = new RustTerminal();"
echo ""
