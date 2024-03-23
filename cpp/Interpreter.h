#pragma once
//bitluni was here
#include <stdint.h>

const int STACK_SIZE = 0x100;
const int HEAP_SIZE = 0x1000;
const int GFX_SIZE = 0x400;

class MemoryMap
{
public:
    uint8_t heap[HEAP_SIZE];
    uint8_t gfx[GFX_SIZE];

    MemoryMap()
    {
    }

    void write32(uint8_t *a, int o, int v)
    {
        a[o++] = v & 0xff;
        a[o++] = (v >> 8) & 0xff;
        a[o++] = (v >> 16) & 0xff;
        a[o] = (v >> 24) & 0xff;
    }

    int read32(uint8_t *a, int o)
    {
        return (int)a[o++] | ((int)a[o++] << 8) | ((int)a[o++] << 16)| ((int)a[o] << 24);
    }

    void store(int a, int v)
    {
        switch(a & 0xf000)
        {
            case 0x0000:
                write32(heap, a & (HEAP_SIZE - 1), v);
                break;
            case 0xa000:
                write32(gfx, a & (GFX_SIZE - 1), v);
                break;
            case 0xf000:
                break;
        }
    }


    int load(int a)
    {
        switch(a & 0xf000)
        {
            case 0x0000:
                return read32(heap, a & (HEAP_SIZE - 1));
            case 0xa000:
                return read32(gfx, a & (GFX_SIZE - 1));
            case 0xf000:
                return 0;//io[a & 0xfff];
        }
        return 0;
    }
};

class Interpreter
{
    public:
    const uint8_t *code;
    int codeSize;
    int SP;
    int IP;
    int stack[STACK_SIZE];
    MemoryMap mem;

    Interpreter()
    {
        this->code = 0;
        codeSize = 0;
        SP = STACK_SIZE;
        IP = 0;
    }

    void init(const uint8_t *code, int size)
    {
        this->code = code;
        codeSize = size;
        SP = STACK_SIZE;
        IP = 0;
    }

    void push(int v)
    {
        stack[--SP] = v;
    }

    int pop()
    {
        return stack[SP++];
    }

    void clone()
    {
        push(stack[SP]);
    }

    void stor()
    {
        int a = pop(); //address
        int v = pop(); //value
        mem.store(a, v);
    }

    void loads()
    {
        int o = pop();
        push(stack[SP + o]);
    }

    void stors()
    {
        int o = pop(); //offset
        int v = pop(); //value
        stack[SP + o] = v;
    }

    void load()
    {
        push(mem.load(pop()));
    }

    void swap()
    {
        int a = pop();
        int b = pop();
        push(a);
        push(b);
    }

    void jmp()
    {
        int a = pop();
        IP = a;
    }

    void jz()
    {
        int a = pop();
        int v = pop();
        if(v == 0)
            IP = a;
    }

    void jnz()
    {
        int a = pop();
        int v = pop();
        if(v != 0)
            IP = a;
    }

    void jg()
    {
        int a = pop();
        int v2 = pop();
        int v1 = pop();
        if(v1 > v2)
            IP = a;
    }

    void jge()
    {
        int a = pop();
        int v2 = pop();
        int v1 = pop();
        if(v1 >= v2)
            IP = a;
    }

    void je()
    {
        int a = pop();
        int v2 = pop();
        int v1 = pop();
        if(v1 == v2)
            IP = a;
    }

    void jne()
    {
        int a = pop();
        int v2 = pop();
        int v1 = pop();
        if(v1 != v2)
            IP = a;
    }

//ALU
    void and_()
    {
        int b = pop();
        int a = pop();
        push(a & b);
    }

    void or_()
    {
        int b = pop();
        int a = pop();
        push(a | b);
    }

    void xor_()
    {
        int b = pop();
        int a = pop();
        push(a ^ b);
    }

    void not_()
    {
        int a = pop();
        push(~a);
    }

    void inc()
    {
        int v = pop();
        push(v + 1);
    }

    void dec()
    {
        int v = pop();
        push(v - 1);
    }

    void add()
    {
        int b = pop();
        int a = pop();
        push(a + b);
    }

    void sub()
    {
        int b = pop();
        int a = pop();
        push(a - b);
    }

    void shr()
    {
        int b = pop();
        int a = pop();
        push(a >> b);
    }

    void shl()
    {
        int b = pop();
        int a = pop();
        push(a << b);
    }

    void mul()
    {
        int b = pop();
        int a = pop();
        push(a * b);
    }

    void div()
    {
        int b = pop();
        int a = pop();
        push(a / b);
    }

    void mod()
    {
        int b = pop();
        int a = pop();
        push(a % b);
    }

    void neg()
    {
        int v = pop();
        push(-v);
    }

    void abs()
    {
        int v = pop();
        push(v < 0 ? -v : v);
    }

    void debug()
    {
    }

    void nop()
    {
    }

    void execute()
    {
        if(IP >= codeSize)
        {
            IP = 0;
            SP = STACK_SIZE;
        }

        switch(code[IP++])
        {
            case 0:
                push((int)code[IP++] | ((int)code[IP++] << 8) | ((int)code[IP++] << 16)| ((int)code[IP++] << 24));
                break;
            case 1: pop(); break;
            case 3: stor(); break;
            case 2: load(); break;
            case 4:
                push((int)code[IP++]);
                break;
            case 5:
                push((int)code[IP++] | ((int)code[IP++] << 8));
                break;
            case 6: clone(); break;
            case 7: loads(); break;
            case 8: stors(); break;
            case 9: swap(); break;
            case 16: jmp(); break;
            case 17: jz(); break;
            case 18: jnz(); break;
            case 19: jg(); break;
            case 20: jge(); break;
            case 21: je(); break;
            case 22: jne(); break;
            case 32: and_(); break;
            case 33: or_(); break;
            case 34: xor_(); break;
            case 35: not_(); break;
            case 36: inc(); break;
            case 37: dec(); break;
            case 38: add(); break;
            case 39: sub(); break;
            case 40: shl(); break;
            case 41: shr(); break;
            case 42: mul(); break;
            case 43: div(); break;
            case 44: mod(); break;
            case 45: neg(); break;
            case 46: abs(); break;
            case 254: debug(); break;
            case 255: nop(); break;
        }
    }
};

