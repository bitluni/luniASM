# what?

open source interpreter for tiny game consoles

# why ?

because we can

# what?

## Run the JS IDE locally

```sh
# If you have python3 installed
python3 -m http.server 8080

# If you have node installed
npx http-server -p 8080

open http://localhost:8080
```

## opcodes
```
push
	pushes 1 value or label address to stack. 32 bit
pop
	removes 1 value from stack
stor
	stores st(1) to mem[st(0)]. removes 2 values from stack

	//write 69 to memory address 0x1000 and clear the stack
	push 69
	push 0x1000
	stor

load
	loads value from memory mem[st(0)] to stack. removes 1 address from stack. pushes 1 value to stack

	//loads value from memory address 0x1000 checks if its 69 if yes jumps to nice. 
	//stack is clean afterwards
	push 0x1000
	load
	push 69
	push nice
	je

pushb
	pushes 1 value or label address to stack. 8 bit	(size coding)
pushw
	pushes 1 value or label address to stack. 16 bit (size coding)
clone
	clones the top value on stack. 
loads
	loads value from stack with offset and pushes it to the top of the stack (extension)

	//copy value from stack index 1 (after removing the 1 from the stack)
	push 69
	push 42
	push 1
	loads
	pop //69
	pop //42
	pop //69

stors
	stores a value st(1) to the stack with offset st(st(0)) (extension)

	//overwrite 0 with the value 69 on the stack
	push 0
	push 42
	push 69
	push 1
	stors
	pop //42
	pop //69

swap
	swaps the two top stack values

jmp
	jumps to address st(0). address is removed from stack
jz
	jumps to address st(0) if s(1) is zero. 2 values are removed from stack

	//jumps to label zero. stack is cleared
	push 0
	push zero
	jz

jnz
	jumps to address st(0) if s(1) is not zero. 2 values are removed from stack
jg
	jumps to address st(0) if s(2) > st(1). 3 values are removed from stack

	//copares 2 > 1 and then jumps to label. stack is cleared
	push 2
	push 1
	push yeah2isGreaterThan1
	jg

jge
	jumps to address st(0) if s(2) >= st(1). 3 values are removed from stack
je
	jumps to address st(0) if s(2) == st(1). 3 values are removed from stack
jne
	jumps to address st(0) if s(2) != st(1). 3 values are removed from stack
and
	st(1) & st(0). 2 values popped result pushed
or
	st(1) & st(0). 2 values popped result pushed
xor
	st(1) ^ st(0). 2 values popped result pushed
not
	~st(0). 2 values popped result pushed

	//invert the top of the stack
	push 0x00000000
	neg
	pop //0xffffffff

inc
	st(0)++
dec
	st(0)--
add
	st(1) + st(0). 2 values popped result pushed

	//adds 2 and 3
	push 2
	push 3
	add
	pop //5

sub
	st(1) - st(0). 2 values popped result pushed
shl
	st(1) << st(0). 2 values popped result pushed
shr
	st(1) >> st(0). 2 values popped result pushed
mul
	st(1) * st(0). 2 values popped result pushed
div
	st(1) / st(0). 2 values popped result pushed (1 cycle execution might not be possible)
mod
	st(1) % st(0). 2 values popped result pushed (1 cycle execution might not be possible)
neg
	-st(0)
abs
	|st(0)|

debug
	breakpoint
nop
	do nothing
```

## hardware addresses

```
0x0000 heap

0xa000 gfx frame buffer
0xe000 flash storage
0xf000 hardware
	0x000 system
		0x00 clock cycles (one opcode per clock)
		0x04 clocks per second (setting)
		0x10 xres
		0x14 yres
	0x100 io pins
		0x00 up
		0x04 down
		0x08 left
		0x0c right
		0x10 a
		0x14 b
		0x80 LDR range [0..255] (optional)
	0x800 sound
		0x00 square wave hz / 16
		0x04 square wave amplitude (255 max)
		0x10 sine wave hz / 16
		0x14 sine wave amplitude (255 max)
		0x20 triangle wave hz / 16
		0x24 triangle wave amplitude (255 max)
		0x30 reserved
		0x34 noise aplitude (255 max)
```

# license

take it and run 1.0
