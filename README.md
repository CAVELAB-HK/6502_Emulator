# 6502 Assembly Emulator

A minimalistic, Japanese-inspired 6502 assembly emulator built with pure HTML, CSS, and JavaScript. This project provides an educational platform for learning 6502 assembly programming with real-time execution and debugging capabilities.

## Overview

The 6502 processor, originally designed by MOS Technology in 1975, powered many iconic computers including the Apple II, Commodore 64, and Nintendo Entertainment System. This emulator faithfully recreates the 6502's instruction set and behavior, making it an ideal learning tool for understanding low-level programming concepts.

## Features

- **Complete 6502 CPU Implementation**: All major registers (A, X, Y, PC, SP, P) with accurate flag handling
- **Real-time Assembly Parsing**: Write assembly code and see immediate execution
- **Visual Memory Display**: Monitor memory changes in real-time
- **Screen Output System**: Display both ASCII characters and hexadecimal values
- **Step-by-step Debugging**: Execute programs instruction by instruction
- **Professional Interface**: Clean, distraction-free design focused on functionality

## Live Demo

The emulator is available online at: https://cavelab-hk.github.io/6502_Emulator/

## 6502 Assembly Language Tutorial

### Introduction to Assembly Language

Assembly language is a low-level programming language that directly corresponds to machine code instructions. Unlike high-level languages, assembly provides direct control over the processor's registers and memory, making it essential for system programming, embedded development, and understanding computer architecture.

### The 6502 Processor Architecture

#### Registers

The 6502 contains several registers that serve different purposes:

**Accumulator (A)**
- 8-bit register used for arithmetic and logical operations
- Primary working register for most calculations
- Only register that can perform arithmetic operations

**Index Registers (X, Y)**
- 8-bit registers used for indexing memory locations
- Can be incremented, decremented, and used in addressing modes
- Often used for loop counters and array indexing

**Program Counter (PC)**
- 16-bit register pointing to the next instruction to execute
- Automatically incremented after each instruction
- Can be modified by jump and branch instructions

**Stack Pointer (SP)**
- 8-bit register pointing to the current stack location
- Stack is located at memory addresses $0100-$01FF
- Decrements when pushing data, increments when pulling

**Processor Status (P)**
- 8-bit register containing status flags
- Each bit represents a different condition flag

#### Status Flags

The processor status register contains the following flags:

- **Carry (C)**: Set when arithmetic operations produce a carry or borrow
- **Zero (Z)**: Set when the result of an operation is zero
- **Interrupt Disable (I)**: Controls whether interrupts are enabled
- **Decimal (D)**: Enables binary-coded decimal arithmetic mode
- **Break (B)**: Set when a BRK instruction is executed
- **Overflow (V)**: Set when signed arithmetic produces an invalid result
- **Negative (N)**: Set when the result of an operation is negative (bit 7 set)

### Memory Organization

The 6502 uses a 16-bit address bus, providing access to 64KB of memory:

- **$0000-$00FF**: Zero Page - Fast access memory
- **$0100-$01FF**: Stack - Used for subroutine calls and temporary storage
- **$0200-$02FF**: Screen Memory (in this emulator) - Output display area
- **$0600-$FFFF**: Program Memory - Where user programs are loaded

### Addressing Modes

The 6502 supports several addressing modes that determine how operands are accessed:

#### Immediate Addressing
```assembly
LDA #$48    ; Load the literal value $48 into accumulator
```
The operand is the actual value to be used. Prefixed with #.

#### Zero Page Addressing
```assembly
LDA $80     ; Load the value from memory location $80
```
Accesses the first 256 bytes of memory. Faster than absolute addressing.

#### Absolute Addressing
```assembly
LDA $0200   ; Load the value from memory location $0200
```
Uses a full 16-bit address to access any memory location.

#### Implied Addressing
```assembly
INX         ; Increment X register
```
No operand needed; the instruction operates on a specific register.

#### Relative Addressing
```assembly
BNE loop    ; Branch to label 'loop' if zero flag is clear
```
Used by branch instructions. Operand is an offset from the current position.

### Instruction Set Reference

#### Load and Store Instructions

**LDA - Load Accumulator**
```assembly
LDA #$48    ; Load immediate value
LDA $80     ; Load from zero page
LDA $0200   ; Load from absolute address
```
Loads a value into the accumulator and sets the zero and negative flags.

**LDX - Load X Register**
```assembly
LDX #$10    ; Load immediate value into X
LDX $80     ; Load from zero page into X
```
Loads a value into the X register and sets the zero and negative flags.

**LDY - Load Y Register**
```assembly
LDY #$20    ; Load immediate value into Y
LDY $80     ; Load from zero page into Y
```
Loads a value into the Y register and sets the zero and negative flags.

**STA - Store Accumulator**
```assembly
STA $0200   ; Store accumulator to memory address $0200
STA $80     ; Store accumulator to zero page address $80
```
Stores the accumulator value to memory. Does not affect flags.

**STX - Store X Register**
```assembly
STX $0201   ; Store X register to memory
STX $81     ; Store X register to zero page
```
Stores the X register value to memory. Does not affect flags.

**STY - Store Y Register**
```assembly
STY $0202   ; Store Y register to memory
STY $82     ; Store Y register to zero page
```
Stores the Y register value to memory. Does not affect flags.

#### Arithmetic Instructions

**ADC - Add with Carry**
```assembly
ADC #$05    ; Add 5 to accumulator (plus carry flag)
```
Adds the operand and carry flag to the accumulator. Sets carry, zero, overflow, and negative flags.

**SBC - Subtract with Carry**
```assembly
SBC #$03    ; Subtract 3 from accumulator (minus carry flag)
```
Subtracts the operand and carry flag from the accumulator. Sets carry, zero, overflow, and negative flags.

#### Increment and Decrement Instructions

**INX - Increment X Register**
```assembly
INX         ; Add 1 to X register
```
Increments X register by 1. Sets zero and negative flags.

**INY - Increment Y Register**
```assembly
INY         ; Add 1 to Y register
```
Increments Y register by 1. Sets zero and negative flags.

**DEX - Decrement X Register**
```assembly
DEX         ; Subtract 1 from X register
```
Decrements X register by 1. Sets zero and negative flags.

**DEY - Decrement Y Register**
```assembly
DEY         ; Subtract 1 from Y register
```
Decrements Y register by 1. Sets zero and negative flags.

#### Comparison Instructions

**CMP - Compare Accumulator**
```assembly
CMP #$10    ; Compare accumulator with value $10
```
Compares accumulator with operand by performing subtraction without storing result. Sets carry, zero, and negative flags.

#### Control Flow Instructions

**JMP - Jump**
```assembly
JMP $0610   ; Jump to address $0610
JMP loop    ; Jump to label 'loop'
```
Unconditionally transfers control to the specified address.

**BNE - Branch if Not Equal**
```assembly
BNE loop    ; Branch to 'loop' if zero flag is clear
```
Branches if the zero flag is clear (last comparison was not equal).

**BEQ - Branch if Equal**
```assembly
BEQ end     ; Branch to 'end' if zero flag is set
```
Branches if the zero flag is set (last comparison was equal).

**BRK - Break**
```assembly
BRK         ; Stop program execution
```
Stops program execution and sets the break flag.

**NOP - No Operation**
```assembly
NOP         ; Do nothing for one cycle
```
Performs no operation but consumes one instruction cycle.

### Programming Examples

#### Example 1: Hello World
```assembly
; Display "Hello" on screen
LDA #$48    ; Load 'H' (ASCII 72)
STA $0200   ; Store to screen memory position 0
LDA #$65    ; Load 'e' (ASCII 101)
STA $0201   ; Store to screen memory position 1
LDA #$6C    ; Load 'l' (ASCII 108)
STA $0202   ; Store to screen memory position 2
LDA #$6C    ; Load 'l' (ASCII 108)
STA $0203   ; Store to screen memory position 3
LDA #$6F    ; Load 'o' (ASCII 111)
STA $0204   ; Store to screen memory position 4
BRK         ; End program
```

#### Example 2: Simple Arithmetic
```assembly
; Calculate 5 + 3 and display result
LDA #$05    ; Load 5 into accumulator
ADC #$03    ; Add 3 (result: 8 in accumulator)
STA $0200   ; Store result to screen (displays as [08])
BRK         ; End program
```

#### Example 3: Loop Counter
```assembly
; Count from 0 to 9 and display
LDX #$00    ; Initialize counter to 0
loop:
    TXA         ; Transfer X to accumulator (not implemented in basic emulator)
    ADC #$30    ; Convert to ASCII (add 48)
    STA $0200   ; Display digit
    INX         ; Increment counter
    CPX #$0A    ; Compare with 10
    BNE loop    ; Branch back if not equal
BRK         ; End program
```

#### Example 4: Memory Fill
```assembly
; Fill memory locations with a pattern
LDA #$FF    ; Load pattern value
LDX #$00    ; Initialize index
fill_loop:
    STA $0200,X ; Store pattern at $0200 + X (indexed addressing)
    INX         ; Increment index
    CPX #$10    ; Check if we've filled 16 locations
    BNE fill_loop ; Continue if not done
BRK         ; End program
```

### Programming Techniques

#### Using Labels
Labels provide readable names for memory addresses and program locations:
```assembly
start:      ; Label marking program start
    LDA #$00
    JMP end ; Jump to end label
end:        ; Label marking program end
    BRK
```

#### ASCII Character Handling
To display readable text, use ASCII values:
```assembly
; ASCII values for common characters
; 'A' = $41, 'a' = $61
; '0' = $30, '9' = $39
; Space = $20, newline = $0A

LDA #$41    ; Load 'A'
STA $0200   ; Display 'A'
```

#### Flag-based Programming
Use comparison results to control program flow:
```assembly
LDA #$05
CMP #$05    ; Compare with 5
BEQ equal   ; Branch if equal
; Code for not equal case
JMP done
equal:
; Code for equal case
done:
BRK
```

### Debugging Techniques

#### Single-step Execution
Use the Step button to execute one instruction at a time and observe:
- Register changes
- Memory modifications
- Flag status updates

#### Memory Monitoring
Watch the memory display to see how your program affects RAM:
- Values change from $00 to actual data
- Modified cells are highlighted
- Screen memory shows immediate output

#### Register Tracking
Monitor register values to understand program flow:
- PC shows current instruction location
- A, X, Y show working data
- P shows current processor flags

### Common Programming Patterns

#### Initialization
```assembly
; Clear registers and set initial state
LDA #$00    ; Clear accumulator
LDX #$00    ; Clear X register
LDY #$00    ; Clear Y register
```

#### Data Movement
```assembly
; Copy data between memory locations
LDA $80     ; Load from source
STA $90     ; Store to destination
```

#### Conditional Execution
```assembly
; Execute code based on condition
LDA value
CMP #$00
BEQ zero_case
; Non-zero case code here
JMP done
zero_case:
; Zero case code here
done:
```

### Error Handling and Debugging

#### Common Errors
- **Infinite loops**: Forgetting to modify loop conditions
- **Incorrect addressing**: Using wrong addressing modes
- **Flag misunderstanding**: Not accounting for flag side effects
- **Memory conflicts**: Overwriting important data

#### Debugging Strategies
1. Use step-by-step execution to trace program flow
2. Monitor register and memory changes
3. Verify flag states after operations
4. Check branch conditions carefully
5. Ensure proper program termination with BRK

### Performance Considerations

#### Cycle Counting
Each instruction takes a specific number of clock cycles:
- Simple operations (LDA immediate): 2 cycles
- Memory operations (LDA absolute): 4 cycles
- Branch instructions: 2 cycles (3 if branch taken)

#### Memory Efficiency
- Use zero page addressing when possible (faster than absolute)
- Minimize memory accesses
- Keep frequently used data in registers

### Advanced Topics

#### Stack Usage
The stack is used for temporary storage and subroutine calls:
- Stack grows downward from $01FF
- Push operations decrement stack pointer
- Pull operations increment stack pointer

#### Interrupt Handling
The 6502 supports interrupt processing:
- Interrupt Disable flag controls interrupt acceptance
- Break flag indicates software interrupt (BRK instruction)

## Getting Started with the Emulator

### Basic Usage
1. **Write Code**: Enter 6502 assembly code in the text area
2. **Assemble**: Click "Assemble" to convert to machine code
3. **Execute**: Use "Run" for full execution or "Step" for debugging
4. **Monitor**: Watch registers, memory, and screen output
5. **Reset**: Clear state and start over

### Loading Examples
Click "Load Example" to see the Hello World program, then modify it to experiment with different instructions and techniques.

### Screen Output
The emulator displays output in the screen area:
- Printable ASCII characters (32-126) appear normally
- Non-printable values appear as [XX] where XX is hexadecimal
- Screen memory range: $0200-$02FF

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
- **CPU Core**: Complete 6502 instruction set implementation
- **Assembler**: Parses assembly source code into machine code
- **Memory System**: 64KB address space with visual display
- **UI Controller**: Manages user interaction and display updates

## Contributing

Contributions are welcome. Areas for improvement include:
- Additional 6502 instructions
- Enhanced addressing modes
- Improved error reporting
- Additional debugging features
- Performance optimizations

## License

MIT License - This project is free to use for educational and development purposes.

## References

- MOS Technology 6502 Microprocessor Family Programming Manual
- "Programming the 6502" by Rodnay Zaks
- Western Design Center W65C02S Datasheet
- 6502.org - The 6502 Microprocessor Resource

---

Developed by CAVELAB
