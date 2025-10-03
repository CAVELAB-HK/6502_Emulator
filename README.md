# 6502 Assembly Emulator 🎌

A minimalistic, Japanese-inspired 6502 assembly emulator built with pure HTML, CSS, and JavaScript.

![6502 Emulator Screenshot](https://raw.githubusercontent.com/CAVELAB-HK/6502_Emulator/main/screenshot.png)

## ✨ Features

- **Authentic 6502 CPU Implementation**: Complete with all major registers (A, X, Y, PC, SP, P)
- **Real-time Assembly**: Parse and execute 6502 assembly code
- **Visual Memory Display**: See memory changes in the $0200-$02FF range
- **Screen Output**: Display both ASCII characters and hex values
- **Step-by-step Execution**: Debug your programs instruction by instruction
- **Japanese Minimalistic Design**: Clean black and white interface

## 🚀 Live Demo

Visit the live emulator: [https://cavelab-hk.github.io/6502_Emulator/](https://cavelab-hk.github.io/6502_Emulator/)

## 🎮 Getting Started

### Quick Example - Hello World
```assembly
LDA #$48    ; Load 'H' (ASCII 72)
STA $0200   ; Store to screen memory
LDA #$65    ; Load 'e' (ASCII 101)
STA $0201   ; Store to screen memory
LDA #$6C    ; Load 'l' (ASCII 108)
STA $0202   ; Store to screen memory
LDA #$6C    ; Load 'l' (ASCII 108)
STA $0203   ; Store to screen memory
LDA #$6F    ; Load 'o' (ASCII 111)
STA $0204   ; Store to screen memory
BRK         ; Break (end program)
```

### Simple Calculation
```assembly
LDA #$05    ; Load 5
ADC #$03    ; Add 3 (result: 8)
STA $0200   ; Store result (displays as [08])
BRK         ; Break
```

### How to Use
1. **Load Example** - Click to load the "Hello World" program
2. **Assemble** - Convert assembly code to machine code
3. **Run** - Execute the entire program at once
4. **Step** - Execute one instruction at a time for debugging
5. **Reset** - Clear CPU state and start over

## 📚 Supported Instructions

| Instruction | Description | Example |
|-------------|-------------|---------|
| `LDA` | Load Accumulator | `LDA #$48` |
| `LDX` | Load X Register | `LDX #$10` |
| `LDY` | Load Y Register | `LDY #$20` |
| `STA` | Store Accumulator | `STA $0200` |
| `STX` | Store X Register | `STX $0201` |
| `STY` | Store Y Register | `STY $0202` |
| `ADC` | Add with Carry | `ADC #$05` |
| `SBC` | Subtract with Carry | `SBC #$03` |
| `INX` | Increment X | `INX` |
| `INY` | Increment Y | `INY` |
| `DEX` | Decrement X | `DEX` |
| `DEY` | Decrement Y | `DEY` |
| `CMP` | Compare | `CMP #$10` |
| `JMP` | Jump | `JMP $0610` |
| `BNE` | Branch if Not Equal | `BNE loop` |
| `BEQ` | Branch if Equal | `BEQ end` |
| `NOP` | No Operation | `NOP` |
| `BRK` | Break | `BRK` |

## 🔧 Technical Details

### Memory Layout
- **Program Memory**: $0600-$FFFF (programs start at $0600)
- **Screen Memory**: $0200-$02FF (visible in screen output)
- **Stack**: $0100-$01FF (standard 6502 stack)

### Addressing Modes
- **Immediate**: `LDA #$48` (load literal value)
- **Zero Page**: `LDA $80` (load from zero page)
- **Absolute**: `LDA $0200` (load from full address)
- **Relative**: `BNE loop` (branch with offset)

### Screen Display
- **ASCII Characters**: Printable characters (32-126) display normally
- **Hex Values**: Non-printable values show as `[XX]` where XX is hex
- **Null Termination**: Display stops at the first $00 byte

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/CAVELAB-HK/6502_Emulator.git

# Navigate to the directory
cd 6502_Emulator

# Open index.html in your browser
open index.html
```

No build process required! Just open `index.html` in any modern web browser.

## 📱 Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🎨 Design Philosophy

This emulator embraces **Japanese minimalism** with:
- **Monospace typography** (JetBrains Mono)
- **Black and white color scheme**
- **Clean, uncluttered interface**
- **Focus on functionality over decoration**

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add more 6502 instructions
- Improve the assembler
- Enhance the UI/UX
- Fix bugs
- Add more example programs

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Inspired by the legendary MOS 6502 processor
- Japanese design principles
- The retro computing community

---

Built with ❤️ by [CAVELAB](https://github.com/CAVELAB-HK)
