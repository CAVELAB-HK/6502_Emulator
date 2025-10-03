/**
 * 6502 Assembly Emulator
 * A minimalist implementation of the MOS 6502 processor
 */

class CPU6502 {
    constructor() {
        this.reset();
        this.initializeInstructions();
    }

    reset() {
        // Registers
        this.A = 0x00;      // Accumulator
        this.X = 0x00;      // X register
        this.Y = 0x00;      // Y register
        this.PC = 0x0600;   // Program Counter (start at $0600)
        this.SP = 0xFF;     // Stack Pointer
        this.P = 0x20;      // Processor Status (unused bit set)
        
        // Memory (64KB)
        this.memory = new Uint8Array(0x10000);
        
        // Flags (stored in P register)
        this.FLAG_CARRY = 0x01;
        this.FLAG_ZERO = 0x02;
        this.FLAG_INTERRUPT = 0x04;
        this.FLAG_DECIMAL = 0x08;
        this.FLAG_BREAK = 0x10;
        this.FLAG_UNUSED = 0x20;
        this.FLAG_OVERFLOW = 0x40;
        this.FLAG_NEGATIVE = 0x80;
        
        this.cycles = 0;
        this.running = false;
        this.assembled = false;
    }

    initializeInstructions() {
        this.instructions = {
            // LDA - Load Accumulator
            0xA9: { name: 'LDA', mode: 'immediate', cycles: 2, execute: this.LDA.bind(this) },
            0xA5: { name: 'LDA', mode: 'zeropage', cycles: 3, execute: this.LDA.bind(this) },
            0xAD: { name: 'LDA', mode: 'absolute', cycles: 4, execute: this.LDA.bind(this) },
            
            // LDX - Load X Register
            0xA2: { name: 'LDX', mode: 'immediate', cycles: 2, execute: this.LDX.bind(this) },
            0xA6: { name: 'LDX', mode: 'zeropage', cycles: 3, execute: this.LDX.bind(this) },
            
            // LDY - Load Y Register
            0xA0: { name: 'LDY', mode: 'immediate', cycles: 2, execute: this.LDY.bind(this) },
            0xA4: { name: 'LDY', mode: 'zeropage', cycles: 3, execute: this.LDY.bind(this) },
            
            // STA - Store Accumulator
            0x85: { name: 'STA', mode: 'zeropage', cycles: 3, execute: this.STA.bind(this) },
            0x8D: { name: 'STA', mode: 'absolute', cycles: 4, execute: this.STA.bind(this) },
            
            // STX - Store X Register
            0x86: { name: 'STX', mode: 'zeropage', cycles: 3, execute: this.STX.bind(this) },
            0x8E: { name: 'STX', mode: 'absolute', cycles: 4, execute: this.STX.bind(this) },
            
            // STY - Store Y Register
            0x84: { name: 'STY', mode: 'zeropage', cycles: 3, execute: this.STY.bind(this) },
            0x8C: { name: 'STY', mode: 'absolute', cycles: 4, execute: this.STY.bind(this) },
            
            // ADC - Add with Carry
            0x69: { name: 'ADC', mode: 'immediate', cycles: 2, execute: this.ADC.bind(this) },
            
            // SBC - Subtract with Carry
            0xE9: { name: 'SBC', mode: 'immediate', cycles: 2, execute: this.SBC.bind(this) },
            
            // INX - Increment X
            0xE8: { name: 'INX', mode: 'implied', cycles: 2, execute: this.INX.bind(this) },
            
            // INY - Increment Y
            0xC8: { name: 'INY', mode: 'implied', cycles: 2, execute: this.INY.bind(this) },
            
            // DEX - Decrement X
            0xCA: { name: 'DEX', mode: 'implied', cycles: 2, execute: this.DEX.bind(this) },
            
            // DEY - Decrement Y
            0x88: { name: 'DEY', mode: 'implied', cycles: 2, execute: this.DEY.bind(this) },
            
            // CMP - Compare Accumulator
            0xC9: { name: 'CMP', mode: 'immediate', cycles: 2, execute: this.CMP.bind(this) },
            
            // JMP - Jump
            0x4C: { name: 'JMP', mode: 'absolute', cycles: 3, execute: this.JMP.bind(this) },
            
            // BNE - Branch if Not Equal
            0xD0: { name: 'BNE', mode: 'relative', cycles: 2, execute: this.BNE.bind(this) },
            
            // BEQ - Branch if Equal
            0xF0: { name: 'BEQ', mode: 'relative', cycles: 2, execute: this.BEQ.bind(this) },
            
            // NOP - No Operation
            0xEA: { name: 'NOP', mode: 'implied', cycles: 2, execute: this.NOP.bind(this) },
            
            // BRK - Break
            0x00: { name: 'BRK', mode: 'implied', cycles: 7, execute: this.BRK.bind(this) }
        };
    }

    // Flag operations
    setFlag(flag, value) {
        if (value) {
            this.P |= flag;
        } else {
            this.P &= ~flag;
        }
    }

    getFlag(flag) {
        return (this.P & flag) !== 0;
    }

    updateZeroAndNegativeFlags(value) {
        this.setFlag(this.FLAG_ZERO, value === 0);
        this.setFlag(this.FLAG_NEGATIVE, (value & 0x80) !== 0);
    }

    // Memory operations
    read(address) {
        return this.memory[address & 0xFFFF];
    }

    write(address, value) {
        this.memory[address & 0xFFFF] = value & 0xFF;
    }

    // Addressing modes
    getOperand(mode) {
        switch (mode) {
            case 'immediate':
                return this.read(this.PC++);
            case 'zeropage':
                return this.read(this.read(this.PC++));
            case 'absolute':
                const low = this.read(this.PC++);
                const high = this.read(this.PC++);
                return this.read((high << 8) | low);
            case 'relative':
                const offset = this.read(this.PC++);
                return offset > 127 ? offset - 256 : offset;
            case 'implied':
                return 0;
            default:
                return 0;
        }
    }

    getAddress(mode) {
        switch (mode) {
            case 'zeropage':
                return this.read(this.PC++);
            case 'absolute':
                const low = this.read(this.PC++);
                const high = this.read(this.PC++);
                return (high << 8) | low;
            default:
                return 0;
        }
    }

    // Instructions
    LDA(mode) {
        this.A = this.getOperand(mode);
        this.updateZeroAndNegativeFlags(this.A);
    }

    LDX(mode) {
        this.X = this.getOperand(mode);
        this.updateZeroAndNegativeFlags(this.X);
    }

    LDY(mode) {
        this.Y = this.getOperand(mode);
        this.updateZeroAndNegativeFlags(this.Y);
    }

    STA(mode) {
        const address = this.getAddress(mode);
        this.write(address, this.A);
    }

    STX(mode) {
        const address = this.getAddress(mode);
        this.write(address, this.X);
    }

    STY(mode) {
        const address = this.getAddress(mode);
        this.write(address, this.Y);
    }

    ADC(mode) {
        const value = this.getOperand(mode);
        const carry = this.getFlag(this.FLAG_CARRY) ? 1 : 0;
        const result = this.A + value + carry;
        
        this.setFlag(this.FLAG_CARRY, result > 0xFF);
        this.setFlag(this.FLAG_OVERFLOW, 
            ((this.A ^ result) & (value ^ result) & 0x80) !== 0);
        
        this.A = result & 0xFF;
        this.updateZeroAndNegativeFlags(this.A);
    }

    SBC(mode) {
        const value = this.getOperand(mode);
        const carry = this.getFlag(this.FLAG_CARRY) ? 0 : 1;
        const result = this.A - value - carry;
        
        this.setFlag(this.FLAG_CARRY, result >= 0);
        this.setFlag(this.FLAG_OVERFLOW, 
            ((this.A ^ result) & ((this.A ^ value) & 0x80)) !== 0);
        
        this.A = result & 0xFF;
        this.updateZeroAndNegativeFlags(this.A);
    }

    INX() {
        this.X = (this.X + 1) & 0xFF;
        this.updateZeroAndNegativeFlags(this.X);
    }

    INY() {
        this.Y = (this.Y + 1) & 0xFF;
        this.updateZeroAndNegativeFlags(this.Y);
    }

    DEX() {
        this.X = (this.X - 1) & 0xFF;
        this.updateZeroAndNegativeFlags(this.X);
    }

    DEY() {
        this.Y = (this.Y - 1) & 0xFF;
        this.updateZeroAndNegativeFlags(this.Y);
    }

    CMP(mode) {
        const value = this.getOperand(mode);
        const result = this.A - value;
        
        this.setFlag(this.FLAG_CARRY, this.A >= value);
        this.updateZeroAndNegativeFlags(result & 0xFF);
    }

    JMP(mode) {
        const address = this.getAddress(mode);
        this.PC = address;
    }

    BNE(mode) {
        if (!this.getFlag(this.FLAG_ZERO)) {
            const offset = this.getOperand(mode);
            this.PC = (this.PC + offset) & 0xFFFF;
        } else {
            this.PC++; // Skip the offset byte
        }
    }

    BEQ(mode) {
        if (this.getFlag(this.FLAG_ZERO)) {
            const offset = this.getOperand(mode);
            this.PC = (this.PC + offset) & 0xFFFF;
        } else {
            this.PC++; // Skip the offset byte
        }
    }

    NOP() {
        // Do nothing
    }

    BRK() {
        this.running = false;
        this.setFlag(this.FLAG_BREAK, true);
    }

    step() {
        if (!this.running || !this.assembled) return false;

        const opcode = this.read(this.PC++);
        const instruction = this.instructions[opcode];

        if (instruction) {
            instruction.execute(instruction.mode);
            this.cycles += instruction.cycles;
            return true;
        } else {
            console.error(`Unknown opcode: $${opcode.toString(16).toUpperCase().padStart(2, '0')}`);
            this.running = false;
            return false;
        }
    }

    run() {
        this.running = true;
        let stepCount = 0;
        const maxSteps = 10000; // Prevent infinite loops
        
        while (this.running && stepCount < maxSteps) {
            if (!this.step()) break;
            stepCount++;
        }
        
        if (stepCount >= maxSteps) {
            console.warn('Program halted due to step limit');
            this.running = false;
        }
    }
}

class Assembler {
    constructor() {
        this.opcodes = {
            'LDA': { '#': 0xA9, 'zp': 0xA5, 'abs': 0xAD },
            'LDX': { '#': 0xA2, 'zp': 0xA6 },
            'LDY': { '#': 0xA0, 'zp': 0xA4 },
            'STA': { 'zp': 0x85, 'abs': 0x8D },
            'STX': { 'zp': 0x86, 'abs': 0x8E },
            'STY': { 'zp': 0x84, 'abs': 0x8C },
            'ADC': { '#': 0x69 },
            'SBC': { '#': 0xE9 },
            'INX': { 'imp': 0xE8 },
            'INY': { 'imp': 0xC8 },
            'DEX': { 'imp': 0xCA },
            'DEY': { 'imp': 0x88 },
            'CMP': { '#': 0xC9 },
            'JMP': { 'abs': 0x4C },
            'BNE': { 'rel': 0xD0 },
            'BEQ': { 'rel': 0xF0 },
            'NOP': { 'imp': 0xEA },
            'BRK': { 'imp': 0x00 }
        };
        
        this.labels = {};
    }

    assemble(source) {
        const lines = source.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith(';'));
        const machineCode = [];
        let address = 0x0600; // Start address
        
        this.labels = {};
        
        // First pass: collect labels
        let currentAddress = address;
        for (const line of lines) {
            if (line.endsWith(':')) {
                const label = line.slice(0, -1).trim();
                this.labels[label] = currentAddress;
            } else {
                const instruction = this.parseLine(line);
                if (instruction) {
                    currentAddress += this.getInstructionSize(instruction);
                }
            }
        }
        
        // Second pass: generate machine code
        currentAddress = address;
        for (const line of lines) {
            if (line.endsWith(':')) {
                continue; // Skip labels
            }
            
            const instruction = this.parseLine(line);
            if (instruction) {
                const bytes = this.assembleInstruction(instruction, currentAddress);
                machineCode.push(...bytes);
                currentAddress += bytes.length;
            }
        }
        
        return { machineCode, startAddress: address };
    }

    parseLine(line) {
        const commentIndex = line.indexOf(';');
        if (commentIndex !== -1) {
            line = line.substring(0, commentIndex).trim();
        }
        
        if (!line) return null;
        
        const parts = line.split(/\s+/);
        const mnemonic = parts[0].toUpperCase();
        const operand = parts.slice(1).join(' ').trim();
        
        return { mnemonic, operand };
    }

    assembleInstruction(instruction, address) {
        const { mnemonic, operand } = instruction;
        
        if (!this.opcodes[mnemonic]) {
            throw new Error(`Unknown instruction: ${mnemonic}`);
        }
        
        if (!operand) {
            // Implied addressing
            const opcode = this.opcodes[mnemonic]['imp'];
            if (opcode === undefined) {
                throw new Error(`Invalid addressing mode for ${mnemonic}`);
            }
            return [opcode];
        }
        
        if (operand.startsWith('#$')) {
            // Immediate addressing
            const value = parseInt(operand.substring(2), 16);
            const opcode = this.opcodes[mnemonic]['#'];
            if (opcode === undefined) {
                throw new Error(`Immediate addressing not supported for ${mnemonic}`);
            }
            return [opcode, value];
        }
        
        if (operand.startsWith('$')) {
            // Absolute or zero page addressing
            const value = parseInt(operand.substring(1), 16);
            if (value <= 0xFF) {
                // Zero page
                const opcode = this.opcodes[mnemonic]['zp'];
                if (opcode !== undefined) {
                    return [opcode, value];
                }
            }
            // Absolute
            const opcode = this.opcodes[mnemonic]['abs'];
            if (opcode === undefined) {
                throw new Error(`Absolute addressing not supported for ${mnemonic}`);
            }
            return [opcode, value & 0xFF, (value >> 8) & 0xFF];
        }
        
        // Check for label (for jumps/branches)
        if (this.labels[operand] !== undefined) {
            if (mnemonic === 'JMP') {
                const addr = this.labels[operand];
                return [this.opcodes[mnemonic]['abs'], addr & 0xFF, (addr >> 8) & 0xFF];
            } else if (mnemonic === 'BNE' || mnemonic === 'BEQ') {
                const offset = this.labels[operand] - (address + 2);
                if (offset < -128 || offset > 127) {
                    throw new Error(`Branch target too far: ${offset}`);
                }
                return [this.opcodes[mnemonic]['rel'], offset & 0xFF];
            }
        }
        
        throw new Error(`Invalid operand: ${operand} for ${mnemonic}`);
    }

    getInstructionSize(instruction) {
        const { mnemonic, operand } = instruction;
        
        if (!operand) return 1; // Implied
        if (operand.startsWith('#')) return 2; // Immediate
        if (operand.startsWith('$')) {
            const value = parseInt(operand.substring(1), 16);
            return value <= 0xFF ? 2 : 3; // Zero page or absolute
        }
        
        // Label reference
        if (mnemonic === 'JMP') return 3;
        if (mnemonic === 'BNE' || mnemonic === 'BEQ') return 2;
        
        return 2; // Default
    }
}

// Main application
class EmulatorApp {
    constructor() {
        this.cpu = new CPU6502();
        this.assembler = new Assembler();
        this.initializeUI();
        this.loadExample();
    }

    initializeUI() {
        // Get UI elements
        this.assemblyCode = document.getElementById('assembly-code');
        this.consoleOutput = document.getElementById('console-output');
        this.screenOutput = document.getElementById('screen-output');
        this.memoryDisplay = document.getElementById('memory-display');
        
        // Register displays
        this.regA = document.getElementById('reg-a');
        this.regX = document.getElementById('reg-x');
        this.regY = document.getElementById('reg-y');
        this.regPC = document.getElementById('reg-pc');
        this.regSP = document.getElementById('reg-sp');
        this.regP = document.getElementById('reg-p');
        
        // Bind event listeners
        document.getElementById('assemble').addEventListener('click', () => this.assemble());
        document.getElementById('run').addEventListener('click', () => this.run());
        document.getElementById('step').addEventListener('click', () => this.step());
        document.getElementById('reset').addEventListener('click', () => this.reset());
        document.getElementById('loadExample').addEventListener('click', () => this.loadExample());
        document.getElementById('clearCode').addEventListener('click', () => this.clearCode());
        
        this.updateDisplay();
        this.initializeMemoryDisplay();
    }

    loadExample() {
        const exampleCode = `; Hello World Example
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
LDA #$20    ; Load ' ' (ASCII 32)
STA $0205   ; Store to screen memory
LDA #$57    ; Load 'W' (ASCII 87)
STA $0206   ; Store to screen memory
LDA #$6F    ; Load 'o' (ASCII 111)
STA $0207   ; Store to screen memory
LDA #$72    ; Load 'r' (ASCII 114)
STA $0208   ; Store to screen memory
LDA #$6C    ; Load 'l' (ASCII 108)
STA $0209   ; Store to screen memory
LDA #$64    ; Load 'd' (ASCII 100)
STA $020A   ; Store to screen memory
BRK         ; Break (end program)

; Try this calculation example:
; LDA #$05    ; Load 5
; ADC #$03    ; Add 3 (result: 8)
; STA $0200   ; Store result (will show as [08])`;
        
        this.assemblyCode.value = exampleCode;
        this.log('Example program loaded');
    }

    clearCode() {
        this.assemblyCode.value = '';
        this.log('Code cleared');
    }

    assemble() {
        try {
            const result = this.assembler.assemble(this.assemblyCode.value);
            
            // Clear memory
            this.cpu.memory.fill(0);
            
            // Load machine code into memory
            for (let i = 0; i < result.machineCode.length; i++) {
                this.cpu.write(result.startAddress + i, result.machineCode[i]);
            }
            
            this.cpu.PC = result.startAddress;
            this.cpu.assembled = true;
            
            this.log(`Assembly successful: ${result.machineCode.length} bytes`);
            this.updateDisplay();
        } catch (error) {
            this.log(`Assembly error: ${error.message}`);
        }
    }

    run() {
        if (!this.cpu.assembled) {
            this.log('Please assemble the code first');
            return;
        }
        
        this.cpu.run();
        this.updateDisplay();
        this.updateScreen();
        this.log('Program execution completed');
    }

    step() {
        if (!this.cpu.assembled) {
            this.log('Please assemble the code first');
            return;
        }
        
        if (this.cpu.step()) {
            this.updateDisplay();
            this.updateScreen();
            this.log(`Step executed: PC=$${this.cpu.PC.toString(16).toUpperCase().padStart(4, '0')}`);
        } else {
            this.log('Program halted');
        }
    }

    reset() {
        this.cpu.reset();
        this.updateDisplay();
        this.updateScreen();
        this.clearMemoryDisplay();
        this.log('CPU reset');
    }

    updateDisplay() {
        this.regA.textContent = this.cpu.A.toString(16).toUpperCase().padStart(2, '0');
        this.regX.textContent = this.cpu.X.toString(16).toUpperCase().padStart(2, '0');
        this.regY.textContent = this.cpu.Y.toString(16).toUpperCase().padStart(2, '0');
        this.regPC.textContent = this.cpu.PC.toString(16).toUpperCase().padStart(4, '0');
        this.regSP.textContent = this.cpu.SP.toString(16).toUpperCase().padStart(2, '0');
        this.regP.textContent = this.cpu.P.toString(16).toUpperCase().padStart(2, '0');
        
        this.updateMemoryDisplay();
    }

    updateScreen() {
        let output = '';
        for (let i = 0x0200; i <= 0x02FF; i++) {
            const char = this.cpu.read(i);
            if (char === 0) {
                break; // Stop at null terminator
            } else if (char >= 32 && char <= 126) {
                // Printable ASCII characters
                output += String.fromCharCode(char);
            } else {
                // Non-printable characters - show as hex values in brackets
                output += `[${char.toString(16).toUpperCase().padStart(2, '0')}]`;
            }
        }
        this.screenOutput.textContent = output;
    }

    initializeMemoryDisplay() {
        this.memoryDisplay.innerHTML = '';
        for (let i = 0x0200; i <= 0x02FF; i++) {
            const cell = document.createElement('div');
            cell.className = 'memory-cell';
            cell.id = `mem-${i.toString(16)}`;
            cell.textContent = '00';
            this.memoryDisplay.appendChild(cell);
        }
    }

    updateMemoryDisplay() {
        for (let i = 0x0200; i <= 0x02FF; i++) {
            const cell = document.getElementById(`mem-${i.toString(16)}`);
            if (cell) {
                const value = this.cpu.read(i);
                cell.textContent = value.toString(16).toUpperCase().padStart(2, '0');
                cell.className = value !== 0 ? 'memory-cell modified' : 'memory-cell';
            }
        }
    }

    clearMemoryDisplay() {
        for (let i = 0x0200; i <= 0x02FF; i++) {
            const cell = document.getElementById(`mem-${i.toString(16)}`);
            if (cell) {
                cell.textContent = '00';
                cell.className = 'memory-cell';
            }
        }
    }

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.consoleOutput.textContent += `[${timestamp}] ${message}\n`;
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EmulatorApp();
});
