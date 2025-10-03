# 6502 Assembly Emulator

A minimalistic, Japanese-inspired 6502 assembly emulator built with pure HTML, CSS, and JavaScript. This project provides an educational platform for learning 6502 assembly programming with real-time execution and debugging capabilities.

## Features

- **Complete 6502 CPU Implementation**: All major registers (A, X, Y, PC, SP, P) with accurate flag handling
- **Comprehensive Instruction Set**: 50+ instructions including arithmetic, logical, branching, and stack operations
- **Real-time Assembly Parsing**: Write assembly code and see immediate execution
- **Visual Memory Display**: Monitor memory changes in real-time
- **Screen Output System**: Display both ASCII characters and hexadecimal values
- **Step-by-step Debugging**: Execute programs instruction by instruction
- **Professional Interface**: Clean, distraction-free design focused on functionality

## Live Demo

The emulator is available online at: https://cavelab-hk.github.io/6502_Emulator/

## Quick Start

### Basic Usage
1. **Write Code**: Enter 6502 assembly code in the text area
2. **Assemble**: Click "Assemble" to convert to machine code
3. **Execute**: Use "Run" for full execution or "Step" for debugging
4. **Monitor**: Watch registers, memory, and screen output
5. **Reset**: Clear state and start over

### Simple Examples

**Hello World:**
```assembly
LDA #$48    ; Load 'H' (ASCII 72)
STA $0200   ; Store to screen memory
LDA #$65    ; Load 'e' (ASCII 101)
STA $0201   ; Store to screen memory
BRK         ; End program
```

**Arithmetic:**
```assembly
LDA #$05    ; Load 5
ADC #$03    ; Add 3 (result: 8)
STA $0200   ; Store result (displays as [08])
BRK         ; End program
```

**Register Transfer:**
```assembly
LDA #$42    ; Load value into A
TAX         ; Transfer A to X
TXA         ; Transfer X back to A
STA $0200   ; Display result
BRK         ; End program
```

### Screen Output
- **ASCII Characters** (32-126): Display as normal text
- **Non-printable Values**: Show as [XX] where XX is hexadecimal
- **Memory Range**: $0200-$02FF used for screen output

## Supported Instructions

### Essential Instructions Summary

| Category | Instructions | Description |
|----------|-------------|-------------|
| **Load/Store** | LDA, LDX, LDY, STA, STX, STY | Move data between registers and memory |
| **Transfer** | TAX, TAY, TXA, TYA | Copy data between registers |
| **Stack** | PHA, PLA, PHP, PLP | Push/pull data to/from stack |
| **Arithmetic** | ADC, SBC | Add/subtract with carry |
| **Logical** | AND, ORA, EOR, BIT | Bitwise operations |
| **Increment** | INX, INY, DEX, DEY | Increment/decrement registers |
| **Compare** | CMP, CPX, CPY | Compare registers with values |
| **Branch** | BEQ, BNE, BCC, BCS, BMI, BPL, BVC, BVS | Conditional jumps |
| **Jump** | JMP, JSR, RTS | Unconditional jumps and subroutines |
| **Flags** | CLC, SEC, CLV, SEI, CLI | Control processor flags |
| **Utility** | NOP, BRK | No operation and break |

### Addressing Modes
- **Immediate**: `LDA #$42` (literal value)
- **Zero Page**: `LDA $80` (fast memory access)
- **Absolute**: `LDA $1234` (full memory address)
- **Implied**: `INX` (no operand needed)
- **Relative**: `BNE loop` (branch offset)

## Complete Documentation

For comprehensive learning materials, see [ASSEMBLY_TUTORIAL.md](ASSEMBLY_TUTORIAL.md) which includes:

- **Complete 6502 Architecture Guide**: Detailed processor and memory organization
- **Full Instruction Set Reference**: Every instruction with examples and flag effects
- **Programming Examples**: From basic to advanced techniques
- **Best Practices**: Code organization, optimization, and debugging
- **Advanced Topics**: Subroutines, interrupts, data structures, and algorithms

## Memory Layout

- **Zero Page**: $0000-$00FF (fast access memory)
- **Stack**: $0100-$01FF (subroutine calls and temporary storage)
- **Screen**: $0200-$02FF (output display area)
- **Program**: $0600-$FFFF (where user programs are loaded)

## Technical Implementation

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Local Development
```bash
git clone https://github.com/CAVELAB-HK/6502_Emulator.git
cd 6502_Emulator
open index.html
```

No build process required. The emulator runs entirely in the browser using vanilla JavaScript.

### Architecture
- **CPU Core**: Complete 6502 instruction set implementation with accurate timing
- **Assembler**: Parses assembly source code into machine code with label support
- **Memory System**: 64KB address space with visual display and change tracking
- **UI Controller**: Real-time updates of registers, memory, and screen output

## Educational Value

This emulator is ideal for:

- **Computer Science Students**: Understanding processor architecture and assembly language
- **Retro Computing Enthusiasts**: Exploring classic 8-bit programming techniques
- **Game Developers**: Learning low-level optimization and hardware constraints
- **Educators**: Teaching fundamental computing concepts with hands-on examples

The clean, professional interface focuses attention on learning rather than distracting visual elements, following Japanese minimalist design principles.

## Contributing

Contributions are welcome. Areas for improvement include:
- Additional 6502 instructions and addressing modes
- Enhanced debugging features and visualizations
- More comprehensive error reporting and validation
- Additional programming examples and tutorials
- Performance optimizations and code cleanup

## License

MIT License - This project is free to use for educational and development purposes.

## References

- MOS Technology 6502 Microprocessor Family Programming Manual
- "Programming the 6502" by Rodnay Zaks
- Western Design Center W65C02S Datasheet
- 6502.org - The 6502 Microprocessor Resource

---

Developed by CAVELAB
