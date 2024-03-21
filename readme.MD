## what?

open source interpreter for tiny game consoles

## why ?

because we can

## what?

push
	pushes 1 value or label address to stack. 32 bit
pop
	removes 1 value from stack
stor
	stores st(1) to mem[st(0)]. removes 2 values from stack
load
	loads value from memory mem[st(0)] to stack. removes 1 address from stack. pushes 1 value to stack
pushb
	pushes 1 value or label address to stack. 8 bit	(size coding)
pushw
	pushes 1 value or label address to stack. 16 bit (size coding)
clone
	clones the top value on stack. 
loads
	loads value from stack with offset and pushes it to the top of the stack (extension)
stors
	stores a value st(1) to the stack with offset st(st(0)) (extension)
jmp
	jumps to address st(0). address is removed from stack
jz
	jumps to address st(0) if s(1) is zero. 2 values are removed from stack
jnz
	jumps to address st(0) if s(1) is not zero. 2 values are removed from stack
jz
	jumps to address st(0) if s(2) > st(1). 3 values are removed from stack
jnz
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
inc
	st(0)++
dec
	st(1)--
add
	st(1) + st(0). 2 values popped result pushed
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
};

## license

take it and run 1.0

