class Interpreter
{
	constructor(code, framebuffer = 0)
	{
		//TODO memory map
		//  code structure
		//	[op] 
		//	[push] [byte] [byte] [byte] [byte] 
		//	labels are byte offsets
		this.halted = false;
		this.IP = 0;
		this.flags = 0;
		this.stack = [];
		this.heap = new Int32Array(0x1000);
		this.code = code;	//uint8array
		this.opcodes = {
			0: this.push,
			1: this.pop,
			2: this.load,
			3: this.stor,

			8: this.jmp,
			9: this.jz,
			10: this.jnz,

			32: this.and,
			33: this.or,
			34: this.xor,
			35: this.not,
			36: this.inc,
			37: this.dec,
		}
	}

	execute()
	{
		if(this.IP >= this.code.length) 
		{
			this.IP = 0;
			this.stack = [];
		}

		let op = this.code[this.IP++];
		if (this.opcodes[op] == this.push)
		{
			let v = this.code[this.IP++] | 
				(this.code[this.IP++] << 8) |
				(this.code[this.IP++] << 16) |
				(this.code[this.IP++] << 24);
			this.push(v);
		}
		else this.opcodes[op]();
	}

	push(v)
	{
		this.stack.push(v);
	}

	pop()
	{
		return this.stack.pop();
	}

	stor()
	{
		//on stack address, value
		let v = this.pop();
		let a = this.pop();
		if(a < 0x1000)
			this.heap[this.pop()] = v;
		else
			if(a >= 0xA000 && a < 0xB000)
			{
				if(framebuffer)
					framebuffer(a - 0xA000, v);
			}
	}

	load()
	{
		this.push(this.heap[this.pop()]);
	}

	jmp()
	{
		let a = this.pop();
		this.IP = a;
	}

	jz()
	{
		let a = this.pop();
		let v = this.pop();
		this.push(v);
		if(v === 0) 
			this.IP = a;
	}

	jnz()
	{
		let a = this.pop();
		let v = this.pop();
		this.push(v);
		if(v !== 0) 
			this.IP = a;
	}

//ALU
	and()
	{
		let b = this.pop();
		let a = this.pop();
		this.push(a & b);
	}

	or()
	{
		let b = this.pop();
		let a = this.pop();
		this.push(a | b);
	}

	xor()
	{		
		let b = this.pop();
		let a = this.pop();
		this.push(a ^ b);
	}

	not()
	{
		let a = this.pop();
		this.push(~a);
	}

	inc()
	{
		let v = this.pop();
		this.push(v + 1);
	}

	dec()
	{
		let v = this.pop();
		this.push(v - 1);
	}

}