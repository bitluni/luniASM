class Compiler
{
	constructor(text)
	{
		this.opcodes = {
			0: "push",
			1: "pop",
			2: "load",
			3: "stor",

			8: "jmp",
			9: "jz",
			10: "jnz",

			32: "and",
			33: "or",
			34: "xor",
			35: "not",
			36: "inc",
			37: "dec"
		};
	}
	
	swap(json)
	{
		var ret = {};
		for(var key in json)
		{
			ret[json[key]] = key;
		}
		return ret;
	}

	compile(text, console)
	{
		const opcodes = this.swap(this.opcodes);
		const code = [];
		const lines = text.split("\n");
		const labels = {};
		const labelInstances = {};
		for(let i = 0; i < lines.length; i++)
		{
			let line = lines[i].trim();
			const c1 = line.indexOf(";");
			const c2 = line.indexOf("//");			
			const c = (c1 != -1) && (c1 < c2) ? c1 : c2;
			if(c > -1)
				line = line.substr(0, c).trim();
			let token = line.replace(/[\t| ].*/,'');
			if(token[token.length - 1] == ':')
			{
				const label = token.substr(0, token.length - 1);
				if(!isNaN(this.parseInt32(label)))
				{
					//already defined
					console.error("label can't be a number: " + label + " line " + i);
				}

				if(label in labels)
				{
					//already defined
					console.error("label already defined " + token + " line " + i);
				}
				labels[label] = code.length;
				line = line.substr(token.length).trim();
				token = line.replace(/[\t| ].*/,'');
			}
			if(token.length)
			{
				if(token in opcodes)
				{
					this.appendInt8(code, opcodes[token]);
					if(opcodes[token] == 0) //push
					{
						line = line.substr(token.length).trim();
						token = line.replace(/[\t| ].*/,'');
						const v = this.parseInt32(token);
						if(isNaN(v))
						{
							//label
							if(token in labelInstances)
								labelInstances[token].push(code.length);
							else
								labelInstances[token] = [code.length];
							this.appendInt32(code, 0);
						}
						else
							this.appendInt32(code, v);
					}
					line = line.substr(token.length).trim();
					if(line.length)
					{
						//extra operands?
						console.error("extra characters: " + line + " in line " + i);
					}
				}
				else
				{
					//first token needs to be opcode, yet ( could be also data with implicit push
					console.error("unknown opcode: " + token + " in line " + i);
				}
			}
			lines[i] = token;
		} 
		for(const label in labels)
			for(let j = 0; j < labelInstances[label]; j++)
				this.writeInt32(code, labelInstances[label][j], labels[label]);
		return new Uint8Array(code);
	}

	decompile(code)
	{
		let i = 0;
		while(i < code.length)
		{
			const o = code[i++];
			let line = this.opcodes[o];
			if(o == 0)
				line += " " + (code[i++] | (code[i++] << 8) | (code[i++] << 16) | (code[i++] << 24)).toString(16);
			console.log(line);
		}
	}

	parseInt32(t)
	{
		if(t.startsWith("0x"))
			return parseInt(t.substr(2), 16)
		else if(t.startsWith("0b"))
			return parseInt(t.substr(2), 2)
		return parseInt(t);
	}

	appendInt8(a, v)
	{
		a.push(v);
	}

	appendInt32(a, v)
	{
		a.push(v & 255);
		a.push((v >> 8) & 255);
		a.push((v >> 16) & 255);
		a.push((v >> 24) & 255);
	}

	writeInt32(a, i, v)
	{
		a[i] = v & 255;
		a[i + 1] = (v >> 8) & 255;
		a[i + 2] = (v >> 16) & 255;
		a[i + 3] = (v >> 24) & 255;
	}
};

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
		//console.log(this.opcodes[op].name + " " + op + " " + (this.IP-1));
		if (this.opcodes[op] == this.push)
		{
			let v = this.code[this.IP++] | 
				(this.code[this.IP++] << 8) |
				(this.code[this.IP++] << 16) |
				(this.code[this.IP++] << 24);
			this.push(v);
		}
		else 
			this.opcodes[op].call(this);
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
		let a = this.pop();
		let v = this.pop();
		if(a < 0x1000)
			this.heap[a] = v;
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

};