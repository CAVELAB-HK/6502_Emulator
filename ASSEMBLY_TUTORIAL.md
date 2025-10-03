# Complete 6502 Assembly Language Tutorial

This comprehensive guide covers all aspects of 6502 assembly programming, from basic concepts to advanced techniques.

## Table of Contents

1. [Introduction to Assembly Language](#introduction-to-assembly-language)
2. [6502 Processor Architecture](#6502-processor-architecture)
3. [Memory Organization](#memory-organization)
4. [Addressing Modes](#addressing-modes)
5. [Complete Instruction Set](#complete-instruction-set)
6. [Programming Examples](#programming-examples)
7. [Advanced Programming Techniques](#advanced-programming-techniques)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [Debugging Techniques](#debugging-techniques)

## Introduction to Assembly Language

Assembly language is a low-level programming language that provides direct control over the processor's operations. Each assembly instruction corresponds to a specific machine code operation that the processor can execute directly.

### Why Learn Assembly Language?

- **Understanding Computer Architecture**: Learn how processors work at the fundamental level
- **Performance Optimization**: Write highly efficient code for time-critical applications
- **System Programming**: Develop operating systems, device drivers, and embedded systems
- **Reverse Engineering**: Understand and analyze existing programs
- **Educational Value**: Build a solid foundation for understanding all programming concepts

### Assembly vs. High-Level Languages

| Assembly Language | High-Level Languages |
|-------------------|---------------------|
| Direct hardware control | Abstracted hardware access |
| Maximum performance | Developer productivity |
| Minimal runtime overhead | Rich standard libraries |
| Platform-specific | Platform-independent |
| Steep learning curve | Gentler learning curve |

## 6502 Processor Architecture

### Historical Context

The MOS Technology 6502, introduced in 1975, was a revolutionary 8-bit microprocessor that powered many iconic computers:

- **Apple II** (1977) - Personal computer revolution
- **Commodore 64** (1982) - Best-selling home computer
- **Nintendo Entertainment System** (1983) - Video game console
- **BBC Micro** (1981) - Educational computer
- **Atari 2600** (1977) - Video game console

### Register Set

The 6502 has a minimal but efficient register set:

#### Accumulator (A)
- **Size**: 8 bits
- **Purpose**: Primary arithmetic and logic operations
- **Special**: Only register that can perform arithmetic
- **Usage**: Store intermediate results, perform calculations

```assembly
LDA #$42    ; Load 66 into accumulator
ADC #$08    ; Add 8 to accumulator (result: 74)
```

#### Index Registers (X, Y)
- **Size**: 8 bits each
- **Purpose**: Memory indexing, loop counters, general storage
- **Capabilities**: Can be incremented, decremented, compared
- **Addressing**: Used in indexed addressing modes

```assembly
LDX #$10    ; Load 16 into X register
LDY #$20    ; Load 32 into Y register
INX         ; Increment X (now 17)
DEY         ; Decrement Y (now 31)
```

#### Program Counter (PC)
- **Size**: 16 bits
- **Purpose**: Points to the next instruction to execute
- **Behavior**: Automatically incremented after each instruction
- **Control**: Modified by jumps, branches, and subroutine calls

```assembly
        ; PC starts at $0600
LDA #$42    ; PC becomes $0602 (2-byte instruction)
JMP $0700   ; PC becomes $0700 (jump instruction)
```

#### Stack Pointer (SP)
- **Size**: 8 bits
- **Purpose**: Points to current position in stack
- **Range**: Stack located at $0100-$01FF
- **Behavior**: Decrements on push, increments on pull

```assembly
LDA #$42    ; Load value
PHA         ; Push A to stack (SP decrements)
LDA #$00    ; Clear A
PLA         ; Pull from stack (SP increments, A = $42)
```

#### Processor Status (P)
- **Size**: 8 bits
- **Purpose**: Contains processor status flags
- **Flags**: Each bit represents a different condition

### Status Flags Detailed

#### Carry Flag (C) - Bit 0
- **Set when**: Arithmetic operations produce carry/borrow
- **Used for**: Multi-byte arithmetic, unsigned comparisons
- **Instructions**: ADC, SBC, ASL, LSR, ROL, ROR, CMP, CPX, CPY

```assembly
LDA #$FF    ; Load 255
ADC #$01    ; Add 1 (result: 0, Carry set)
LDA #$80    ; Load 128  
CMP #$40    ; Compare with 64 (Carry set because 128 >= 64)
```

#### Zero Flag (Z) - Bit 1
- **Set when**: Result of operation is zero
- **Used for**: Equality testing, loop termination
- **Instructions**: Most arithmetic and logic operations

```assembly
LDA #$05    ; Load 5
SBC #$05    ; Subtract 5 (result: 0, Zero flag set)
BEQ done    ; Branch if equal (Zero flag set)
```

#### Interrupt Disable (I) - Bit 2
- **Set when**: Interrupts are disabled
- **Used for**: Critical code sections
- **Instructions**: SEI (set), CLI (clear)

```assembly
SEI         ; Disable interrupts
; Critical code here
CLI         ; Enable interrupts
```

#### Decimal Mode (D) - Bit 3
- **Set when**: Binary-Coded Decimal mode enabled
- **Used for**: BCD arithmetic (not commonly used)
- **Instructions**: SED (set), CLD (clear)

#### Break Flag (B) - Bit 4
- **Set when**: BRK instruction executed
- **Used for**: Software interrupt identification
- **Instructions**: BRK sets this flag

#### Unused - Bit 5
- **Always set**: This bit is always 1
- **Purpose**: No specific function, always reads as 1

#### Overflow Flag (V) - Bit 6
- **Set when**: Signed arithmetic produces invalid result
- **Used for**: Signed number range checking
- **Instructions**: ADC, SBC, BIT, CLV

```assembly
LDA #$7F    ; Load 127 (maximum positive signed 8-bit)
ADC #$01    ; Add 1 (result: 128 = -128, Overflow set)
```

#### Negative Flag (N) - Bit 7
- **Set when**: Result has bit 7 set (negative in signed arithmetic)
- **Used for**: Sign testing
- **Instructions**: Most arithmetic and logic operations

```assembly
LDA #$80    ; Load 128 (negative in signed arithmetic)
           ; Negative flag is set
```

## Memory Organization

### Memory Map

The 6502 addresses 64KB of memory (addresses $0000-$FFFF):

#### Zero Page ($0000-$00FF)
- **Size**: 256 bytes
- **Special**: Faster access than other memory
- **Usage**: Variables, pointers, frequently accessed data
- **Advantage**: Zero page addressing uses only 2 bytes vs 3 bytes for absolute

```assembly
LDA $80     ; Zero page addressing (2 bytes)
LDA $0280   ; Absolute addressing (3 bytes)
```

#### Stack ($0100-$01FF)
- **Size**: 256 bytes
- **Usage**: Subroutine return addresses, temporary storage
- **Growth**: Grows downward from $01FF
- **Access**: Via stack pointer (SP)

```assembly
JSR subroutine  ; Pushes return address to stack
RTS             ; Pulls return address from stack
```

#### General Purpose Memory ($0200-$FFFF)
- **Size**: ~63KB
- **Usage**: Program code, data, variables
- **Flexibility**: Can be used for any purpose
- **In this emulator**: $0200-$02FF used for screen output

#### Memory Access Patterns

**Sequential Access**:
```assembly
LDX #$00        ; Initialize index
loop:
    LDA data,X  ; Load data[X]
    STA dest,X  ; Store to dest[X]  
    INX         ; Next index
    CPX #$10    ; Compare with 16
    BNE loop    ; Continue if not done
```

**Indirect Access** (using zero page pointers):
```assembly
; Set up pointer in zero page
LDA #$00    ; Low byte of address
STA $80     ; Store in zero page
LDA #$30    ; High byte of address  
STA $81     ; Store in zero page + 1

; Access via pointer (6502 extended feature)
LDY #$00    ; Index
LDA ($80),Y ; Load from address pointed to by $80/$81
```

## Addressing Modes

The 6502 supports several addressing modes that determine how operands are accessed:

### Immediate Addressing
- **Syntax**: `#value`
- **Description**: Operand is a literal value
- **Size**: 2 bytes (opcode + value)
- **Speed**: Fastest (no memory access needed)

```assembly
LDA #$42    ; Load literal value 66 into A
LDX #$10    ; Load literal value 16 into X
ADC #$05    ; Add literal value 5 to A
```

### Zero Page Addressing
- **Syntax**: `$nn` (where nn = $00-$FF)
- **Description**: Operand address is in zero page
- **Size**: 2 bytes (opcode + zero page address)
- **Speed**: Fast (only one memory access)

```assembly
LDA $80     ; Load from zero page address $80
STA $81     ; Store to zero page address $81
ADC $82     ; Add value from zero page address $82
```

### Absolute Addressing
- **Syntax**: `$nnnn` (where nnnn = $0000-$FFFF)
- **Description**: Operand address is anywhere in memory
- **Size**: 3 bytes (opcode + low byte + high byte)
- **Speed**: Slower (two memory accesses for address)

```assembly
LDA $1234   ; Load from absolute address $1234
STA $5678   ; Store to absolute address $5678
JMP $C000   ; Jump to absolute address $C000
```

### Implied Addressing
- **Syntax**: No operand
- **Description**: Operation affects specific register
- **Size**: 1 byte (opcode only)
- **Speed**: Fast (no operand to fetch)

```assembly
INX         ; Increment X register
TAX         ; Transfer A to X
PHA         ; Push A to stack
RTS         ; Return from subroutine
```

### Relative Addressing
- **Syntax**: `label` or offset
- **Description**: Used by branch instructions
- **Size**: 2 bytes (opcode + signed offset)
- **Range**: -128 to +127 bytes from current PC

```assembly
    CMP #$00    ; Compare A with 0
    BEQ zero    ; Branch if equal to zero
    BNE nonzero ; Branch if not equal to zero
zero:
    ; Handle zero case
nonzero:
    ; Handle non-zero case
```

### Indexed Addressing (Zero Page,X)
- **Syntax**: `$nn,X`
- **Description**: Zero page address + X register
- **Size**: 2 bytes
- **Usage**: Array access in zero page

```assembly
LDX #$05    ; Index = 5
LDA $80,X   ; Load from address $80 + $05 = $85
STA $90,X   ; Store to address $90 + $05 = $95
```

### Indexed Addressing (Absolute,X)
- **Syntax**: `$nnnn,X`
- **Description**: Absolute address + X register
- **Size**: 3 bytes
- **Usage**: Array access anywhere in memory

```assembly
LDX #$10        ; Index = 16
LDA $2000,X     ; Load from $2000 + $10 = $2010
STA buffer,X    ; Store to buffer + 16
```

## Complete Instruction Set

### Data Movement Instructions

#### Load Instructions

**LDA - Load Accumulator**
```assembly
LDA #$42    ; Immediate: A = $42
LDA $80     ; Zero page: A = memory[$80]
LDA $1234   ; Absolute: A = memory[$1234]
```
- **Flags affected**: N, Z
- **Purpose**: Load value into accumulator

**LDX - Load X Register**
```assembly
LDX #$10    ; Immediate: X = $10
LDX $81     ; Zero page: X = memory[$81]
```
- **Flags affected**: N, Z
- **Purpose**: Load value into X register

**LDY - Load Y Register**
```assembly
LDY #$20    ; Immediate: Y = $20
LDY $82     ; Zero page: Y = memory[$82]
```
- **Flags affected**: N, Z
- **Purpose**: Load value into Y register

#### Store Instructions

**STA - Store Accumulator**
```assembly
STA $80     ; Zero page: memory[$80] = A
STA $1234   ; Absolute: memory[$1234] = A
```
- **Flags affected**: None
- **Purpose**: Store accumulator to memory

**STX - Store X Register**
```assembly
STX $81     ; Zero page: memory[$81] = X
STX $1234   ; Absolute: memory[$1234] = X
```
- **Flags affected**: None
- **Purpose**: Store X register to memory

**STY - Store Y Register**
```assembly
STY $82     ; Zero page: memory[$82] = Y
STY $1234   ; Absolute: memory[$1234] = Y
```
- **Flags affected**: None
- **Purpose**: Store Y register to memory

#### Register Transfer Instructions

**TAX - Transfer A to X**
```assembly
LDA #$42    ; A = $42
TAX         ; X = $42 (copy of A)
```
- **Flags affected**: N, Z
- **Purpose**: Copy accumulator to X register

**TAY - Transfer A to Y**
```assembly
LDA #$42    ; A = $42
TAY         ; Y = $42 (copy of A)
```
- **Flags affected**: N, Z
- **Purpose**: Copy accumulator to Y register

**TXA - Transfer X to A**
```assembly
LDX #$42    ; X = $42
TXA         ; A = $42 (copy of X)
```
- **Flags affected**: N, Z
- **Purpose**: Copy X register to accumulator

**TYA - Transfer Y to A**
```assembly
LDY #$42    ; Y = $42
TYA         ; A = $42 (copy of Y)
```
- **Flags affected**: N, Z
- **Purpose**: Copy Y register to accumulator

### Stack Operations

**PHA - Push Accumulator**
```assembly
LDA #$42    ; A = $42
PHA         ; Push $42 to stack, SP decrements
```
- **Flags affected**: None
- **Purpose**: Save accumulator on stack

**PLA - Pull Accumulator**
```assembly
PLA         ; Pull value from stack to A, SP increments
```
- **Flags affected**: N, Z
- **Purpose**: Restore accumulator from stack

**PHP - Push Processor Status**
```assembly
PHP         ; Push status flags to stack
```
- **Flags affected**: None
- **Purpose**: Save processor status on stack

**PLP - Pull Processor Status**
```assembly
PLP         ; Pull status flags from stack
```
- **Flags affected**: All flags
- **Purpose**: Restore processor status from stack

### Arithmetic Instructions

**ADC - Add with Carry**
```assembly
LDA #$10    ; A = $10
ADC #$05    ; A = $10 + $05 + Carry = $15 (if C=0)
```
- **Flags affected**: N, V, Z, C
- **Purpose**: Add operand and carry flag to accumulator

**SBC - Subtract with Carry**
```assembly
LDA #$20    ; A = $20
SBC #$05    ; A = $20 - $05 - (1-Carry) = $1B (if C=1)
```
- **Flags affected**: N, V, Z, C
- **Purpose**: Subtract operand and borrow from accumulator

**Multi-byte Addition Example**:
```assembly
; Add two 16-bit numbers: $1234 + $5678
CLC         ; Clear carry
LDA #$34    ; Low byte of first number
ADC #$78    ; Add low byte of second number
STA result  ; Store low byte result

LDA #$12    ; High byte of first number  
ADC #$56    ; Add high byte + any carry
STA result+1 ; Store high byte result
```

### Increment and Decrement Instructions

**INX - Increment X Register**
```assembly
LDX #$10    ; X = $10
INX         ; X = $11
```
- **Flags affected**: N, Z
- **Purpose**: Add 1 to X register

**INY - Increment Y Register**
```assembly
LDY #$20    ; Y = $20
INY         ; Y = $21
```
- **Flags affected**: N, Z
- **Purpose**: Add 1 to Y register

**DEX - Decrement X Register**
```assembly
LDX #$10    ; X = $10
DEX         ; X = $0F
```
- **Flags affected**: N, Z
- **Purpose**: Subtract 1 from X register

**DEY - Decrement Y Register**
```assembly
LDY #$20    ; Y = $20
DEY         ; Y = $1F
```
- **Flags affected**: N, Z
- **Purpose**: Subtract 1 from Y register

### Logical Instructions

**AND - Logical AND**
```assembly
LDA #$FF    ; A = 11111111 binary
AND #$0F    ; A = 00001111 binary (result: $0F)
```
- **Flags affected**: N, Z
- **Purpose**: Bitwise AND accumulator with operand
- **Uses**: Masking bits, clearing specific bits

**ORA - Logical OR**
```assembly
LDA #$0F    ; A = 00001111 binary
ORA #$F0    ; A = 11111111 binary (result: $FF)
```
- **Flags affected**: N, Z
- **Purpose**: Bitwise OR accumulator with operand
- **Uses**: Setting specific bits

**EOR - Exclusive OR**
```assembly
LDA #$FF    ; A = 11111111 binary
EOR #$FF    ; A = 00000000 binary (result: $00)
```
- **Flags affected**: N, Z
- **Purpose**: Bitwise XOR accumulator with operand
- **Uses**: Toggling bits, simple encryption

**BIT - Bit Test**
```assembly
LDA #$80    ; A = 10000000 binary
BIT #$80    ; Test bit 7, sets flags but doesn't change A
```
- **Flags affected**: N, V, Z
- **Purpose**: Test bits without changing accumulator
- **Special**: N = bit 7 of operand, V = bit 6 of operand

### Comparison Instructions

**CMP - Compare Accumulator**
```assembly
LDA #$20    ; A = $20
CMP #$10    ; Compare A with $10
BCC less    ; Branch if A < $10 (Carry clear)
BEQ equal   ; Branch if A = $10 (Zero set)
; A > $10 if neither branch taken
```
- **Flags affected**: N, Z, C
- **Purpose**: Compare accumulator with operand

**CPX - Compare X Register**
```assembly
LDX #$15    ; X = $15
CPX #$10    ; Compare X with $10
BEQ equal   ; Branch if X = $10
BNE not_equal ; Branch if X ≠ $10
```
- **Flags affected**: N, Z, C
- **Purpose**: Compare X register with operand

**CPY - Compare Y Register**
```assembly
LDY #$25    ; Y = $25
CPY #$20    ; Compare Y with $20
BCS greater_equal ; Branch if Y ≥ $20
```
- **Flags affected**: N, Z, C
- **Purpose**: Compare Y register with operand

### Branch Instructions

All branch instructions use relative addressing with a range of -128 to +127 bytes.

**BEQ - Branch if Equal**
```assembly
CMP #$42    ; Compare A with $42
BEQ found   ; Branch if A = $42 (Z flag set)
```
- **Condition**: Zero flag set (Z = 1)
- **Usage**: Equality testing

**BNE - Branch if Not Equal**
```assembly
CMP #$00    ; Compare A with 0
BNE not_zero ; Branch if A ≠ 0 (Z flag clear)
```
- **Condition**: Zero flag clear (Z = 0)
- **Usage**: Inequality testing, loop continuation

**BCC - Branch if Carry Clear**
```assembly
CMP #$80    ; Compare A with $80
BCC less    ; Branch if A < $80 (unsigned)
```
- **Condition**: Carry flag clear (C = 0)
- **Usage**: Unsigned less than

**BCS - Branch if Carry Set**
```assembly
CMP #$80    ; Compare A with $80
BCS greater_equal ; Branch if A ≥ $80 (unsigned)
```
- **Condition**: Carry flag set (C = 1)
- **Usage**: Unsigned greater than or equal

**BMI - Branch if Minus**
```assembly
LDA value   ; Load some value
BMI negative ; Branch if A is negative (bit 7 = 1)
```
- **Condition**: Negative flag set (N = 1)
- **Usage**: Signed negative testing

**BPL - Branch if Plus**
```assembly
LDA value   ; Load some value
BPL positive ; Branch if A is positive (bit 7 = 0)
```
- **Condition**: Negative flag clear (N = 0)
- **Usage**: Signed positive testing

**BVC - Branch if Overflow Clear**
```assembly
ADC #$01    ; Add 1 to A
BVC no_overflow ; Branch if no signed overflow
```
- **Condition**: Overflow flag clear (V = 0)
- **Usage**: Signed arithmetic validity

**BVS - Branch if Overflow Set**
```assembly
ADC #$01    ; Add 1 to A
BVS overflow ; Branch if signed overflow occurred
```
- **Condition**: Overflow flag set (V = 1)
- **Usage**: Signed arithmetic error detection

### Jump and Subroutine Instructions

**JMP - Jump**
```assembly
JMP $C000   ; Jump to address $C000
JMP loop    ; Jump to label 'loop'
```
- **Purpose**: Unconditional jump to address
- **Usage**: Goto statements, infinite loops

**JSR - Jump to Subroutine**
```assembly
JSR multiply ; Call subroutine at 'multiply'
; Execution continues here after RTS
```
- **Purpose**: Call subroutine, push return address to stack
- **Usage**: Function calls, code reuse

**RTS - Return from Subroutine**
```assembly
multiply:
    ; Subroutine code here
    RTS     ; Return to caller
```
- **Purpose**: Return from subroutine, pull return address from stack
- **Usage**: End of subroutines

### Flag Control Instructions

**CLC - Clear Carry**
```assembly
CLC         ; C = 0
ADC #$01    ; Add without previous carry
```
- **Purpose**: Clear carry flag before arithmetic
- **Usage**: Multi-byte arithmetic initialization

**SEC - Set Carry**
```assembly
SEC         ; C = 1
SBC #$01    ; Subtract with borrow
```
- **Purpose**: Set carry flag
- **Usage**: Subtraction setup, manual carry setting

**CLV - Clear Overflow**
```assembly
CLV         ; V = 0
```
- **Purpose**: Clear overflow flag
- **Usage**: Reset overflow status

**SEI - Set Interrupt Disable**
```assembly
SEI         ; I = 1 (interrupts disabled)
; Critical code here
CLI         ; I = 0 (interrupts enabled)
```
- **Purpose**: Disable interrupts
- **Usage**: Critical sections, initialization

**CLI - Clear Interrupt Disable**
```assembly
CLI         ; I = 0 (interrupts enabled)
```
- **Purpose**: Enable interrupts
- **Usage**: Allow interrupt processing

### Utility Instructions

**NOP - No Operation**
```assembly
NOP         ; Do nothing for 2 cycles
```
- **Purpose**: Timing delays, code alignment
- **Usage**: Precise timing, placeholders

**BRK - Break**
```assembly
BRK         ; Generate software interrupt
```
- **Purpose**: Software interrupt, debugging
- **Usage**: Program termination, breakpoints

## Programming Examples

### Example 1: Basic I/O Operations

```assembly
; Display a character and read input
start:
    LDA #$41    ; Load 'A'
    STA $0200   ; Display character
    
    ; Simple delay loop
    LDX #$FF    ; Load counter
delay:
    DEX         ; Decrement counter
    BNE delay   ; Branch if not zero
    
    ; Change character
    LDA $0200   ; Load current character
    CLC         ; Clear carry
    ADC #$01    ; Add 1 (next letter)
    STA $0200   ; Display new character
    
    JMP start   ; Infinite loop
```

### Example 2: Array Processing

```assembly
; Sum an array of numbers
    LDA #$00    ; Initialize sum
    LDX #$00    ; Initialize index
    
sum_loop:
    CLC         ; Clear carry
    ADC data,X  ; Add array element to sum
    INX         ; Next index
    CPX #$10    ; Compare with array size
    BNE sum_loop ; Continue if not done
    
    STA result  ; Store final sum
    BRK         ; End program
    
data:
    ; Array data would go here
    .byte $01, $02, $03, $04, $05, $06, $07, $08
    .byte $09, $0A, $0B, $0C, $0D, $0E, $0F, $10
    
result:
    .byte $00   ; Storage for result
```

### Example 3: String Processing

```assembly
; Copy a null-terminated string
copy_string:
    LDY #$00    ; Initialize index
    
copy_loop:
    LDA source,Y ; Load source character
    BEQ copy_done ; Branch if null terminator
    STA dest,Y   ; Store to destination
    INY          ; Next character
    JMP copy_loop ; Continue copying
    
copy_done:
    LDA #$00     ; Load null terminator
    STA dest,Y   ; Store null terminator
    RTS          ; Return to caller
    
source:
    .text "HELLO", $00   ; Source string
    
dest:
    .space 16    ; Destination buffer
```

### Example 4: Mathematical Operations

```assembly
; Multiply two 8-bit numbers using repeated addition
multiply:
    LDA #$00    ; Initialize result
    LDX multiplier ; Load multiplier
    BEQ mult_done ; If zero, done
    
mult_loop:
    CLC         ; Clear carry
    ADC multiplicand ; Add multiplicand
    DEX         ; Decrement multiplier
    BNE mult_loop ; Continue if not zero
    
mult_done:
    STA result  ; Store result
    RTS         ; Return
    
multiplicand:
    .byte $07   ; First number
multiplier:
    .byte $09   ; Second number
result:
    .byte $00   ; Result storage
```

### Example 5: Stack Usage

```assembly
; Factorial calculation using stack for recursion
factorial:
    CMP #$01    ; Compare with 1
    BEQ fact_base ; Base case: factorial(1) = 1
    
    PHA         ; Save current number
    SEC         ; Set carry for subtraction
    SBC #$01    ; Subtract 1
    JSR factorial ; Recursive call
    
    ; Multiply result by saved number
    STA temp_result ; Save factorial result
    PLA         ; Restore original number
    
    ; Simple multiplication (assumes small numbers)
    LDX temp_result
    LDA #$00    ; Initialize result
mult_fact:
    CLC
    ADC temp_result
    DEX
    BNE mult_fact
    
    RTS         ; Return result in A
    
fact_base:
    LDA #$01    ; Return 1
    RTS
    
temp_result:
    .byte $00
```

## Advanced Programming Techniques

### Function Parameters and Return Values

#### Parameter Passing via Registers
```assembly
; Function: add_numbers(A, X) -> A
add_numbers:
    ; A contains first parameter
    ; X contains second parameter
    STX temp    ; Save X to memory
    CLC         ; Clear carry
    ADC temp    ; Add X to A
    RTS         ; Return result in A
    
temp: .byte $00

; Usage:
    LDA #$10    ; First parameter
    LDX #$20    ; Second parameter
    JSR add_numbers ; Call function
    ; Result is in A
```

#### Parameter Passing via Stack
```assembly
; Function: add_numbers(param1, param2) -> result
add_numbers:
    ; Parameters pushed to stack before call
    TSX         ; Transfer SP to X
    LDA $0103,X ; Get first parameter
    CLC
    ADC $0102,X ; Add second parameter
    
    ; Clean up stack
    PLA         ; Remove parameter 2
    PLA         ; Remove parameter 1
    PHA         ; Push result
    RTS

; Usage:
    LDA #$10    ; First parameter
    PHA         ; Push to stack
    LDA #$20    ; Second parameter
    PHA         ; Push to stack
    JSR add_numbers
    PLA         ; Get result
```

#### Parameter Passing via Zero Page
```assembly
; Function parameters in zero page
param1 = $80
param2 = $81
result = $82

add_numbers:
    LDA param1  ; Load first parameter
    CLC
    ADC param2  ; Add second parameter
    STA result  ; Store result
    RTS

; Usage:
    LDA #$10
    STA param1  ; Set first parameter
    LDA #$20
    STA param2  ; Set second parameter
    JSR add_numbers
    LDA result  ; Get result
```

### Data Structures

#### Arrays
```assembly
; Array declaration and access
array:
    .byte $10, $20, $30, $40, $50

; Access array element
get_element:
    ; Input: X = index (0-based)
    ; Output: A = array[X]
    LDA array,X
    RTS

; Set array element
set_element:
    ; Input: X = index, A = value
    STA array,X
    RTS
```

#### Structures
```assembly
; Structure definition (person record)
person_size = $06
name_offset = $00    ; 4 bytes for name
age_offset  = $04    ; 1 byte for age
id_offset   = $05    ; 1 byte for ID

; Person array
persons:
    .space person_size * $10  ; 16 persons

; Get person's age
get_age:
    ; Input: X = person index
    ; Output: A = age
    
    ; Calculate base address
    TXA         ; Transfer index to A
    ASL         ; Multiply by 2
    ASL         ; Multiply by 4
    CLC
    ADC X       ; Add original index (now * 5)
    CLC
    ADC X       ; Add again (now * 6)
    TAX         ; Transfer back to X
    
    LDA persons + age_offset,X ; Get age
    RTS
```

#### Linked Lists
```assembly
; Node structure
node_data   = $00   ; 1 byte data
node_next   = $01   ; 1 byte next pointer (zero page address)
node_size   = $02

; Traverse linked list
traverse_list:
    ; Input: A = head pointer (zero page address)
    TAX         ; Current node pointer in X
    
traverse_loop:
    CPX #$00    ; Check for null pointer
    BEQ traverse_done
    
    LDA node_data,X   ; Process node data
    JSR process_node  ; Call processing function
    
    LDX node_next,X   ; Move to next node
    JMP traverse_loop
    
traverse_done:
    RTS

process_node:
    ; Process node data in A
    STA $0200   ; Display or store
    RTS
```

### Memory Management

#### Dynamic Memory Allocation (Simple)
```assembly
; Simple memory allocator
heap_start = $0300
heap_ptr   = $90    ; Current allocation pointer

init_heap:
    LDA #<heap_start  ; Low byte
    STA heap_ptr
    LDA #>heap_start  ; High byte
    STA heap_ptr + 1
    RTS

; Allocate memory block
; Input: A = size needed
; Output: X,Y = address (Y=high, X=low), C=1 if failed
allocate:
    CLC
    ADC heap_ptr      ; Add to current pointer
    STA heap_ptr      ; Update pointer
    BCC alloc_ok      ; Check for overflow
    
    INC heap_ptr + 1  ; Increment high byte
    ; Check if we've exceeded available memory
    LDA heap_ptr + 1
    CMP #$80          ; Assume heap ends at $8000
    BCC alloc_ok
    
    SEC               ; Set carry to indicate failure
    RTS
    
alloc_ok:
    ; Return old pointer value
    SEC
    LDA heap_ptr
    SBC A             ; Subtract allocated size
    TAX               ; Low byte in X
    LDA heap_ptr + 1
    SBC #$00          ; Handle borrow
    TAY               ; High byte in Y
    CLC               ; Clear carry to indicate success
    RTS
```

### Interrupt Handling

#### Setting Up Interrupt Vectors
```assembly
; Interrupt vectors (typically at $FFFA-$FFFF)
    .org $FFFA
    .word nmi_handler    ; NMI vector
    .word reset_handler  ; Reset vector
    .word irq_handler    ; IRQ vector

reset_handler:
    ; Initialize system
    LDX #$FF    ; Initialize stack pointer
    TXS
    CLI         ; Enable interrupts
    JMP main    ; Jump to main program

nmi_handler:
    ; Handle non-maskable interrupt
    PHA         ; Save registers
    TXA
    PHA
    TYA
    PHA
    
    ; Handle NMI
    ; ... NMI code here ...
    
    PLA         ; Restore registers
    TAY
    PLA
    TAX
    PLA
    RTI         ; Return from interrupt

irq_handler:
    ; Handle maskable interrupt
    PHA         ; Save registers
    TXA
    PHA
    TYA
    PHA
    
    ; Handle IRQ
    ; ... IRQ code here ...
    
    PLA         ; Restore registers
    TAY
    PLA
    TAX
    PLA
    RTI         ; Return from interrupt
```

## Best Practices

### Code Organization

#### Use Meaningful Labels
```assembly
; Good
read_user_input:
    JSR get_character
    CMP #$0D        ; Compare with carriage return
    BEQ input_complete
    JMP read_user_input

input_complete:
    RTS

; Bad
loop1:
    JSR sub1
    CMP #$0D
    BEQ end1
    JMP loop1
end1:
    RTS
```

#### Comment Your Code
```assembly
; Calculate factorial of number in A
; Input: A = number (1-8 only)
; Output: A = factorial result
; Destroys: X
factorial:
    CMP #$01        ; Check for base case
    BEQ fact_done   ; If n=1, return 1
    
    TAX             ; Save original number in X
    SEC             ; Set carry for subtraction
    SBC #$01        ; Calculate n-1
    JSR factorial   ; Recursive call for (n-1)!
    
    ; Multiply A by X (simple multiplication)
    LDY A           ; Save factorial result
    LDA #$00        ; Initialize accumulator
mult_loop:
    CLC
    ADC Y           ; Add factorial result
    DEX             ; Decrement multiplier
    BNE mult_loop   ; Continue until done
    
fact_done:
    RTS             ; Return result in A
```

#### Modular Programming
```assembly
; String utilities module
string_utils:

; Copy null-terminated string
; Input: X = source address (low), Y = source address (high)
;        A = dest address (low), stack = dest address (high)
string_copy:
    ; Implementation here
    RTS

; Get string length
; Input: X = string address (low), Y = string address (high)
; Output: A = string length
string_length:
    ; Implementation here
    RTS

; Compare two strings
; Input: X,Y = first string address
;        stack = second string address
; Output: A = 0 if equal, 1 if first > second, -1 if first < second
string_compare:
    ; Implementation here
    RTS
```

### Performance Optimization

#### Use Zero Page for Frequently Accessed Variables
```assembly
; Fast access (2 bytes, 3 cycles)
counter = $80
LDA counter
INC counter

; Slower access (3 bytes, 4 cycles)
LDA $0300
INC $0300
```

#### Minimize Memory Accesses
```assembly
; Inefficient - multiple memory accesses
LDA array_index
TAX
LDA array,X
CLC
ADC #$01
TAX
LDA array_index
TAX
STA array,X

; Efficient - reuse registers
LDA array_index     ; Load index once
TAX                 ; Keep in X
LDA array,X         ; Load value
CLC
ADC #$01           ; Modify value
STA array,X        ; Store back (X still valid)
```

#### Use Appropriate Addressing Modes
```assembly
; Use immediate mode for constants
LDA #$00    ; 2 bytes, 2 cycles

; Use zero page when possible
LDA $80     ; 2 bytes, 3 cycles
LDA $0180   ; 3 bytes, 4 cycles

; Use indexed addressing for arrays
LDX #$05
LDA array,X ; More efficient than calculating addresses
```

### Error Handling

#### Input Validation
```assembly
; Validate input range
get_user_choice:
    JSR read_input      ; Get user input
    CMP #$31           ; Compare with '1'
    BCC invalid_input  ; Branch if less than '1'
    CMP #$35           ; Compare with '5'
    BCS invalid_input  ; Branch if greater than or equal to '5'
    
    ; Valid input (1-4)
    SEC
    SBC #$30           ; Convert ASCII to binary
    RTS                ; Return choice in A

invalid_input:
    LDA #$FF           ; Return error code
    RTS
```

#### Boundary Checking
```assembly
; Safe array access
safe_array_get:
    ; Input: X = index
    ; Output: A = value, C = 1 if error
    CPX #array_size    ; Check upper bound
    BCS bounds_error   ; Branch if index >= size
    
    LDA array,X        ; Safe to access
    CLC                ; Clear carry (success)
    RTS

bounds_error:
    SEC                ; Set carry (error)
    RTS

array_size = $10
array: .space array_size
```

### Memory Usage Optimization

#### Pack Data Efficiently
```assembly
; Use bit fields for flags
game_flags = $90    ; One byte for multiple flags
flag_sound    = %00000001
flag_music    = %00000010
flag_paused   = %00000100
flag_game_over = %00001000

; Set flag
set_sound_flag:
    LDA game_flags
    ORA #flag_sound
    STA game_flags
    RTS

; Clear flag
clear_sound_flag:
    LDA game_flags
    AND #(255 - flag_sound)  ; Clear specific bit
    STA game_flags
    RTS

; Test flag
test_sound_flag:
    LDA game_flags
    AND #flag_sound
    RTS                      ; Z flag set if sound off
```

#### Reuse Memory
```assembly
; Use union-like structures for temporary data
temp_space = $A0    ; 16 bytes of temporary space

; Usage 1: As array of bytes
temp_array = temp_space

; Usage 2: As string buffer  
string_buffer = temp_space

; Usage 3: As structured data
temp_x = temp_space + 0
temp_y = temp_space + 1
temp_color = temp_space + 2
```

## Common Patterns

### Loop Patterns

#### Count-Controlled Loops
```assembly
; For loop equivalent: for(i = 0; i < 10; i++)
    LDX #$00        ; Initialize counter
for_loop:
    ; Loop body here
    CPX #array_size ; Process array element
    LDA array,X
    JSR process_element
    
    INX             ; Increment counter
    CPX #$0A        ; Compare with limit
    BNE for_loop    ; Continue if not done
```

#### Condition-Controlled Loops
```assembly
; While loop equivalent: while(condition)
while_loop:
    JSR check_condition ; Check loop condition
    BEQ while_done      ; Exit if condition false
    
    ; Loop body here
    JSR do_something
    
    JMP while_loop      ; Continue loop

while_done:
    ; Continue after loop
```

#### Do-While Loops
```assembly
; Do-while equivalent: do { ... } while(condition)
do_while_loop:
    ; Loop body here
    JSR do_something
    
    JSR check_condition ; Check condition
    BNE do_while_loop   ; Continue if condition true
```

### Conditional Patterns

#### If-Then-Else
```assembly
; If-then-else structure
    LDA value
    CMP #$80
    BCC else_branch     ; Branch if A < $80

if_branch:
    ; Code for if condition true
    JSR handle_large_value
    JMP endif

else_branch:
    ; Code for if condition false
    JSR handle_small_value

endif:
    ; Continue execution
```

#### Switch-Case (Jump Table)
```assembly
; Switch statement using jump table
switch_statement:
    ; Input: A = case value (0-3)
    CMP #$04
    BCS switch_default  ; Invalid case
    
    ASL                 ; Multiply by 2 (address size)
    TAX                 ; Use as index
    LDA jump_table,X    ; Get low byte of address
    STA jump_addr
    LDA jump_table+1,X  ; Get high byte of address
    STA jump_addr+1
    
    JMP (jump_addr)     ; Jump to handler

jump_table:
    .word case_0        ; Case 0 handler
    .word case_1        ; Case 1 handler  
    .word case_2        ; Case 2 handler
    .word case_3        ; Case 3 handler

case_0:
    ; Handle case 0
    JMP switch_end
    
case_1:
    ; Handle case 1
    JMP switch_end
    
case_2:
    ; Handle case 2
    JMP switch_end
    
case_3:
    ; Handle case 3
    JMP switch_end
    
switch_default:
    ; Handle default case

switch_end:
    ; Continue execution

jump_addr: .word $0000  ; Temporary storage
```

### State Machine Pattern
```assembly
; Simple state machine
state = $A0
state_idle    = $00
state_running = $01
state_paused  = $02
state_stopped = $03

state_machine:
    LDA state
    CMP #state_idle
    BEQ handle_idle
    CMP #state_running
    BEQ handle_running
    CMP #state_paused
    BEQ handle_paused
    CMP #state_stopped
    BEQ handle_stopped
    RTS                 ; Invalid state

handle_idle:
    ; Process idle state
    JSR check_start_condition
    BEQ stay_idle
    LDA #state_running
    STA state
stay_idle:
    RTS

handle_running:
    ; Process running state
    JSR update_game
    JSR check_pause_condition
    BEQ stay_running
    LDA #state_paused
    STA state
stay_running:
    RTS

handle_paused:
    ; Process paused state
    JSR check_resume_condition
    BEQ stay_paused
    LDA #state_running
    STA state
stay_paused:
    RTS

handle_stopped:
    ; Process stopped state
    JSR cleanup
    LDA #state_idle
    STA state
    RTS
```

## Debugging Techniques

### Single-Step Execution
Use the emulator's Step button to execute one instruction at a time:

1. **Set breakpoints** by adding BRK instructions
2. **Watch register values** change with each instruction
3. **Monitor memory** to see data modifications
4. **Track program flow** by observing PC changes

### Memory Watching
Monitor specific memory locations for changes:

```assembly
; Set up test values to watch
LDA #$42
STA $80     ; Watch this location
STA $81     ; And this one

; Modify values and observe
INC $80     ; Should see $80 change to $43
DEC $81     ; Should see $81 change to $41
```

### Flag Analysis
Understand how flags change with operations:

```assembly
; Test flag behavior
LDA #$7F    ; Load 127
ADC #$01    ; Add 1 -> A=$80, N=1, V=1 (overflow!)

LDA #$80    ; Load 128  
CMP #$7F    ; Compare with 127 -> C=1 (128 >= 127)

LDA #$00    ; Load 0
DEC A       ; Decrement -> A=$FF, N=1 (negative)
```

### Common Debugging Patterns

#### Trace Execution
```assembly
; Add trace markers in your code
trace_marker_1:
    LDA #$01
    STA $0300   ; Write marker to memory
    ; Your code here
    
trace_marker_2:
    LDA #$02
    STA $0300   ; Write different marker
    ; More code here
```

#### Value Dumping
```assembly
; Dump register values to memory for inspection
debug_dump:
    STA $0310   ; Save A
    STX $0311   ; Save X  
    STY $0312   ; Save Y
    
    PHP         ; Save processor status
    PLA         ; Pull status to A
    STA $0313   ; Save status flags
    
    RTS
```

#### Assertion Checking
```assembly
; Check assumptions in your code
assert_positive:
    ; Assert that A is positive
    BMI assertion_failed
    RTS

assertion_failed:
    ; Handle assertion failure
    LDA #$FF
    STA $0300   ; Error marker
    BRK         ; Stop execution
```

### Performance Profiling

#### Cycle Counting
Each instruction takes a specific number of cycles:

```assembly
; Count cycles for optimization
fast_routine:           ; Total: 8 cycles
    LDA #$42    ; 2 cycles
    TAX         ; 2 cycles  
    INX         ; 2 cycles
    TXA         ; 2 cycles
    RTS         ; 6 cycles (JSR/RTS pair)

slow_routine:           ; Total: 14 cycles
    LDA #$42    ; 2 cycles
    STA $80     ; 3 cycles
    INC $80     ; 5 cycles
    LDA $80     ; 3 cycles
    RTS         ; 6 cycles (JSR/RTS pair)
```

#### Benchmark Testing
```assembly
; Simple benchmark framework
benchmark_start:
    LDA #$00
    STA cycle_counter
    STA cycle_counter+1
    
    ; Code to benchmark here
    JSR routine_to_test
    
    ; Measure results
    LDA cycle_counter
    STA $0320           ; Low byte of cycle count
    LDA cycle_counter+1
    STA $0321           ; High byte of cycle count
    RTS

; Simple cycle counter (called each instruction)
count_cycle:
    INC cycle_counter
    BNE cycle_done
    INC cycle_counter+1
cycle_done:
    RTS

cycle_counter: .word $0000
```

This completes the comprehensive 6502 Assembly Language Tutorial covering all aspects from basic concepts to advanced programming techniques. The tutorial provides practical examples and real-world programming patterns that will help developers master 6502 assembly programming.
