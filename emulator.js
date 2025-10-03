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
            
            // Register Transfer Instructions
            0xAA: { name: 'TAX', mode: 'implied', cycles: 2, execute: this.TAX.bind(this) },
            0xA8: { name: 'TAY', mode: 'implied', cycles: 2, execute: this.TAY.bind(this) },
            0x8A: { name: 'TXA', mode: 'implied', cycles: 2, execute: this.TXA.bind(this) },
            0x98: { name: 'TYA', mode: 'implied', cycles: 2, execute: this.TYA.bind(this) },
            
            // Stack Operations
            0x48: { name: 'PHA', mode: 'implied', cycles: 3, execute: this.PHA.bind(this) },
            0x68: { name: 'PLA', mode: 'implied', cycles: 4, execute: this.PLA.bind(this) },
            0x08: { name: 'PHP', mode: 'implied', cycles: 3, execute: this.PHP.bind(this) },
            0x28: { name: 'PLP', mode: 'implied', cycles: 4, execute: this.PLP.bind(this) },
            
            // Logical Operations
            0x29: { name: 'AND', mode: 'immediate', cycles: 2, execute: this.AND.bind(this) },
            0x25: { name: 'AND', mode: 'zeropage', cycles: 3, execute: this.AND.bind(this) },
            0x2D: { name: 'AND', mode: 'absolute', cycles: 4, execute: this.AND.bind(this) },
            0x09: { name: 'ORA', mode: 'immediate', cycles: 2, execute: this.ORA.bind(this) },
            0x05: { name: 'ORA', mode: 'zeropage', cycles: 3, execute: this.ORA.bind(this) },
            0x0D: { name: 'ORA', mode: 'absolute', cycles: 4, execute: this.ORA.bind(this) },
            0x49: { name: 'EOR', mode: 'immediate', cycles: 2, execute: this.EOR.bind(this) },
            0x45: { name: 'EOR', mode: 'zeropage', cycles: 3, execute: this.EOR.bind(this) },
            0x4D: { name: 'EOR', mode: 'absolute', cycles: 4, execute: this.EOR.bind(this) },
            0x24: { name: 'BIT', mode: 'zeropage', cycles: 3, execute: this.BIT.bind(this) },
            0x2C: { name: 'BIT', mode: 'absolute', cycles: 4, execute: this.BIT.bind(this) },
            
            // Arithmetic Instructions
            0x69: { name: 'ADC', mode: 'immediate', cycles: 2, execute: this.ADC.bind(this) },
            0x65: { name: 'ADC', mode: 'zeropage', cycles: 3, execute: this.ADC.bind(this) },
            0x6D: { name: 'ADC', mode: 'absolute', cycles: 4, execute: this.ADC.bind(this) },
            0xE9: { name: 'SBC', mode: 'immediate', cycles: 2, execute: this.SBC.bind(this) },
            0xE5: { name: 'SBC', mode: 'zeropage', cycles: 3, execute: this.SBC.bind(this) },
            0xED: { name: 'SBC', mode: 'absolute', cycles: 4, execute: this.SBC.bind(this) },
            
            // Increment/Decrement Instructions
            0xE8: { name: 'INX', mode: 'implied', cycles: 2, execute: this.INX.bind(this) },
            0xC8: { name: 'INY', mode: 'implied', cycles: 2, execute: this.INY.bind(this) },
            0xCA: { name: 'DEX', mode: 'implied', cycles: 2, execute: this.DEX.bind(this) },
            0x88: { name: 'DEY', mode: 'implied', cycles: 2, execute: this.DEY.bind(this) },
            
            // Comparison Instructions
            0xC9: { name: 'CMP', mode: 'immediate', cycles: 2, execute: this.CMP.bind(this) },
            0xC5: { name: 'CMP', mode: 'zeropage', cycles: 3, execute: this.CMP.bind(this) },
            0xCD: { name: 'CMP', mode: 'absolute', cycles: 4, execute: this.CMP.bind(this) },
            0xE0: { name: 'CPX', mode: 'immediate', cycles: 2, execute: this.CPX.bind(this) },
            0xE4: { name: 'CPX', mode: 'zeropage', cycles: 3, execute: this.CPX.bind(this) },
            0xC0: { name: 'CPY', mode: 'immediate', cycles: 2, execute: this.CPY.bind(this) },
            0xC4: { name: 'CPY', mode: 'zeropage', cycles: 3, execute: this.CPY.bind(this) },
            
            // Branch Instructions
            0xF0: { name: 'BEQ', mode: 'relative', cycles: 2, execute: this.BEQ.bind(this) },
            0xD0: { name: 'BNE', mode: 'relative', cycles: 2, execute: this.BNE.bind(this) },
            0x90: { name: 'BCC', mode: 'relative', cycles: 2, execute: this.BCC.bind(this) },
            0xB0: { name: 'BCS', mode: 'relative', cycles: 2, execute: this.BCS.bind(this) },
            0x30: { name: 'BMI', mode: 'relative', cycles: 2, execute: this.BMI.bind(this) },
            0x10: { name: 'BPL', mode: 'relative', cycles: 2, execute: this.BPL.bind(this) },
            0x50: { name: 'BVC', mode: 'relative', cycles: 2, execute: this.BVC.bind(this) },
            0x70: { name: 'BVS', mode: 'relative', cycles: 2, execute: this.BVS.bind(this) },
            
            // Jump and Subroutine Instructions
            0x4C: { name: 'JMP', mode: 'absolute', cycles: 3, execute: this.JMP.bind(this) },
            0x20: { name: 'JSR', mode: 'absolute', cycles: 6, execute: this.JSR.bind(this) },
            0x60: { name: 'RTS', mode: 'implied', cycles: 6, execute: this.RTS.bind(this) },
            
            // Flag Control Instructions
            0x18: { name: 'CLC', mode: 'implied', cycles: 2, execute: this.CLC.bind(this) },
            0x38: { name: 'SEC', mode: 'implied', cycles: 2, execute: this.SEC.bind(this) },
            0xB8: { name: 'CLV', mode: 'implied', cycles: 2, execute: this.CLV.bind(this) },
            0x78: { name: 'SEI', mode: 'implied', cycles: 2, execute: this.SEI.bind(this) },
            0x58: { name: 'CLI', mode: 'implied', cycles: 2, execute: this.CLI.bind(this) },
            
            // Utility Instructions
            0xEA: { name: 'NOP', mode: 'implied', cycles: 2, execute: this.NOP.bind(this) },
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

    // Register Transfer Instructions
    TAX() {
        this.X = this.A;
        this.updateZeroAndNegativeFlags(this.X);
    }

    TAY() {
        this.Y = this.A;
        this.updateZeroAndNegativeFlags(this.Y);
    }

    TXA() {
        this.A = this.X;
        this.updateZeroAndNegativeFlags(this.A);
    }

    TYA() {
        this.A = this.Y;
        this.updateZeroAndNegativeFlags(this.A);
    }

    // Stack Operations
    PHA() {
        this.write(0x0100 + this.SP, this.A);
        this.SP = (this.SP - 1) & 0xFF;
    }

    PLA() {
        this.SP = (this.SP + 1) & 0xFF;
        this.A = this.read(0x0100 + this.SP);
        this.updateZeroAndNegativeFlags(this.A);
    }

    PHP() {
        this.write(0x0100 + this.SP, this.P | this.FLAG_BREAK);
        this.SP = (this.SP - 1) & 0xFF;
    }

    PLP() {
        this.SP = (this.SP + 1) & 0xFF;
        this.P = this.read(0x0100 + this.SP);
        this.setFlag(this.FLAG_BREAK, false);
        this.setFlag(this.FLAG_UNUSED, true);
    }

    // Logical Operations
    AND(mode) {
        const value = this.getOperand(mode);
        this.A = this.A & value;
        this.updateZeroAndNegativeFlags(this.A);
    }

    ORA(mode) {
        const value = this.getOperand(mode);
        this.A = this.A | value;
        this.updateZeroAndNegativeFlags(this.A);
    }

    EOR(mode) {
        const value = this.getOperand(mode);
        this.A = this.A ^ value;
        this.updateZeroAndNegativeFlags(this.A);
    }

    BIT(mode) {
        const value = this.getOperand(mode);
        const result = this.A & value;
        this.setFlag(this.FLAG_ZERO, result === 0);
        this.setFlag(this.FLAG_NEGATIVE, (value & 0x80) !== 0);
        this.setFlag(this.FLAG_OVERFLOW, (value & 0x40) !== 0);
    }

    // Additional Comparison Instructions
    CPX(mode) {
        const value = this.getOperand(mode);
        const result = this.X - value;
        
        this.setFlag(this.FLAG_CARRY, this.X >= value);
        this.updateZeroAndNegativeFlags(result & 0xFF);
    }

    CPY(mode) {
        const value = this.getOperand(mode);
        const result = this.Y - value;
        
        this.setFlag(this.FLAG_CARRY, this.Y >= value);
        this.updateZeroAndNegativeFlags(result & 0xFF);
    }

    // Additional Branch Instructions
    BCC(mode) {
        if (!this.getFlag(this.FLAG_CARRY)) {
            const offset = this.getOperand(mode);
            this.PC = (this.PC + offset) & 0xFFFF;
        } else {
            this.PC++; // Skip the offset byte
        }
    }

    BCS(mode) {
        if (this.getFlag(this.FLAG_CARRY)) {
            const offset = this.getOperand(mode);
            this.PC = (this.PC + offset) & 0xFFFF;
        } else {
            this.PC++; // Skip the offset byte
        }
    }

    BMI(mode) {
        if (this.getFlag(this.FLAG_NEGATIVE)) {
            const offset = this.getOperand(mode);
            this.PC = (this.PC + offset) & 0xFFFF;
        } else {
            this.PC++; // Skip the offset byte
        }
    }

    BPL(mode) {
        if (!this.getFlag(this.FLAG_NEGATIVE)) {
            const offset = this.getOperand(mode);
            this.PC = (this.PC + offset) & 0xFFFF;
        } else {
            this.PC++; // Skip the offset byte
        }
    }

    BVC(mode) {
        if (!this.getFlag(this.FLAG_OVERFLOW)) {
            const offset = this.getOperand(mode);
            this.PC = (this.PC + offset) & 0xFFFF;
        } else {
            this.PC++; // Skip the offset byte
        }
    }

    BVS(mode) {
        if (this.getFlag(this.FLAG_OVERFLOW)) {
            const offset = this.getOperand(mode);
            this.PC = (this.PC + offset) & 0xFFFF;
        } else {
            this.PC++; // Skip the offset byte
        }
    }

    // Subroutine Instructions
    JSR(mode) {
        const address = this.getAddress(mode);
        const returnAddress = this.PC - 1;
        
        // Push return address to stack (high byte first)
        this.write(0x0100 + this.SP, (returnAddress >> 8) & 0xFF);
        this.SP = (this.SP - 1) & 0xFF;
        this.write(0x0100 + this.SP, returnAddress & 0xFF);
        this.SP = (this.SP - 1) & 0xFF;
        
        this.PC = address;
    }

    RTS() {
        // Pull return address from stack (low byte first)
        this.SP = (this.SP + 1) & 0xFF;
        const low = this.read(0x0100 + this.SP);
        this.SP = (this.SP + 1) & 0xFF;
        const high = this.read(0x0100 + this.SP);
        
        this.PC = ((high << 8) | low) + 1;
    }

    // Flag Control Instructions
    CLC() {
        this.setFlag(this.FLAG_CARRY, false);
    }

    SEC() {
        this.setFlag(this.FLAG_CARRY, true);
    }

    CLV() {
        this.setFlag(this.FLAG_OVERFLOW, false);
    }

    SEI() {
        this.setFlag(this.FLAG_INTERRUPT, true);
    }

    CLI() {
        this.setFlag(this.FLAG_INTERRUPT, false);
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
            
            // Register Transfer
            'TAX': { 'imp': 0xAA },
            'TAY': { 'imp': 0xA8 },
            'TXA': { 'imp': 0x8A },
            'TYA': { 'imp': 0x98 },
            
            // Stack Operations
            'PHA': { 'imp': 0x48 },
            'PLA': { 'imp': 0x68 },
            'PHP': { 'imp': 0x08 },
            'PLP': { 'imp': 0x28 },
            
            // Logical Operations
            'AND': { '#': 0x29, 'zp': 0x25, 'abs': 0x2D },
            'ORA': { '#': 0x09, 'zp': 0x05, 'abs': 0x0D },
            'EOR': { '#': 0x49, 'zp': 0x45, 'abs': 0x4D },
            'BIT': { 'zp': 0x24, 'abs': 0x2C },
            
            // Arithmetic
            'ADC': { '#': 0x69, 'zp': 0x65, 'abs': 0x6D },
            'SBC': { '#': 0xE9, 'zp': 0xE5, 'abs': 0xED },
            
            // Increment/Decrement
            'INX': { 'imp': 0xE8 },
            'INY': { 'imp': 0xC8 },
            'DEX': { 'imp': 0xCA },
            'DEY': { 'imp': 0x88 },
            
            // Comparisons
            'CMP': { '#': 0xC9, 'zp': 0xC5, 'abs': 0xCD },
            'CPX': { '#': 0xE0, 'zp': 0xE4 },
            'CPY': { '#': 0xC0, 'zp': 0xC4 },
            
            // Branches
            'BEQ': { 'rel': 0xF0 },
            'BNE': { 'rel': 0xD0 },
            'BCC': { 'rel': 0x90 },
            'BCS': { 'rel': 0xB0 },
            'BMI': { 'rel': 0x30 },
            'BPL': { 'rel': 0x10 },
            'BVC': { 'rel': 0x50 },
            'BVS': { 'rel': 0x70 },
            
            // Jumps and Subroutines
            'JMP': { 'abs': 0x4C },
            'JSR': { 'abs': 0x20 },
            'RTS': { 'imp': 0x60 },
            
            // Flag Control
            'CLC': { 'imp': 0x18 },
            'SEC': { 'imp': 0x38 },
            'CLV': { 'imp': 0xB8 },
            'SEI': { 'imp': 0x78 },
            'CLI': { 'imp': 0x58 },
            
            // Utility
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
            if (mnemonic === 'JMP' || mnemonic === 'JSR') {
                const addr = this.labels[operand];
                return [this.opcodes[mnemonic]['abs'], addr & 0xFF, (addr >> 8) & 0xFF];
            } else if (['BNE', 'BEQ', 'BCC', 'BCS', 'BMI', 'BPL', 'BVC', 'BVS'].includes(mnemonic)) {
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
        if (mnemonic === 'JMP' || mnemonic === 'JSR') return 3;
        if (['BNE', 'BEQ', 'BCC', 'BCS', 'BMI', 'BPL', 'BVC', 'BVS'].includes(mnemonic)) return 2;
        
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
        const exampleCode = `; Enhanced Hello World with new instructions
LDA #$48    ; Load 'H' (ASCII 72)
STA $0200   ; Store to screen memory
LDA #$65    ; Load 'e' (ASCII 101)
STA $0201   ; Store to screen memory
LDA #$6C    ; Load 'l' (ASCII 108)
STA $0202   ; Store to screen memory
STA $0203   ; Store 'l' again
LDA #$6F    ; Load 'o' (ASCII 111)
STA $0204   ; Store to screen memory

; Demonstrate register transfer
LDA #$20    ; Load space character
TAX         ; Transfer A to X
TXA         ; Transfer X back to A
STA $0205   ; Store space

; Counter example using new instructions
LDY #$05    ; Start counter at 5
countloop:
    TYA         ; Transfer Y to A
    ADC #$30    ; Convert to ASCII
    STA $0206   ; Display digit
    DEY         ; Decrement counter
    CPY #$00    ; Compare with 0
    BNE countloop ; Branch if not equal

BRK         ; Break (end program)

; Try these examples too:
; Stack operations:
; LDA #$42
; PHA         ; Push A to stack
; LDA #$00    ; Clear A
; PLA         ; Pull from stack (A = $42 again)

; Logical operations:
; LDA #$FF
; AND #$0F    ; Result: $0F (bitwise AND)
; ORA #$F0    ; Result: $FF (bitwise OR)`;
        
        this.assemblyCode.value = exampleCode;
        this.log('Enhanced example program loaded with new instructions');
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
