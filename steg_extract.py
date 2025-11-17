#!/usr/bin/env python3
"""
Steganography Extraction Tool
Extract hidden data from CTF badge image
"""

from PIL import Image

def extract_lsb_data(image_path, channel='red'):
    """Extract data hidden in LSB of specified channel"""
    img = Image.open(image_path).convert('RGBA')
    pixels = img.load()
    width, height = img.size

    binary_data = ''

    # Extract LSB from specified channel
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if channel == 'red':
                binary_data += str(r & 1)
            elif channel == 'green':
                binary_data += str(g & 1)
            elif channel == 'blue':
                binary_data += str(b & 1)
            else:
                binary_data += str(r & 1)  # default to red

    # Convert binary to text
    message = ''
    for i in range(0, len(binary_data), 8):
        byte = binary_data[i:i+8]
        if len(byte) == 8:
            char_code = int(byte, 2)
            if char_code == 0:  # Null terminator
                break
            # Check for EOF marker (0xFFFE)
            if i + 16 <= len(binary_data):
                marker = binary_data[i:i+16]
                if marker == '1111111111111110':
                    break
            if 32 <= char_code <= 126:  # Printable ASCII
                message += chr(char_code)
            elif char_code == 10:  # Newline
                message += '\n'
            else:
                # Non-printable, might be end of message
                if len(message) > 10:  # If we have substantial data
                    break

    return message

if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("Usage: python3 steg_extract.py <image_file> [channel]")
        print("\nChannel options: red, green, blue (default: red)")
        print("\nExamples:")
        print("  python3 steg_extract.py assets/ctf.png")
        print("  python3 steg_extract.py assets/shadow_badge.png blue")
        sys.exit(1)

    image_path = sys.argv[1]
    channel = sys.argv[2] if len(sys.argv) > 2 else 'red'

    try:
        # Try all channels
        print("=" * 60)
        print(f"STEGANOGRAPHY EXTRACTION: {image_path}")
        print("=" * 60)

        for ch in ['red', 'green', 'blue']:
            hidden_data = extract_lsb_data(image_path, ch)
            if hidden_data.strip():
                print(f"\n[{ch.upper()} CHANNEL]")
                print("-" * 60)
                print(hidden_data)

        print("=" * 60)
    except FileNotFoundError:
        print(f"Error: Image file not found: {image_path}")
        sys.exit(1)
    except Exception as e:
        print(f"Error extracting data: {e}")
        sys.exit(1)
