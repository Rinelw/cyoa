// Intro
class TextScramble {
	constructor(el, start = 'Math.floor(Math.random() * 40)', end = 'Math.floor(Math.random() * 40)') {
		this.el = el;
		this.last = 0;
		this.update = this.update.bind(this);
		this.start = start;
		this.end = end;
	}
	setText(newText, oldText = this.el.innerText) {
		const length = Math.max(oldText.length, newText.length);
		const promise = new Promise((resolve) => this.resolve = resolve);
		this.queue = [];
		for (let i = 0; i < length; i++) {
			const from = oldText[i] || ''
			const to = newText[i] || ''
			const start = eval(this.start);
			const end = start + eval(this.end);
			this.queue.push({
				from,
				to,
				start,
				end
			})
		}
		cancelAnimationFrame(this.frameRequest)
		this.frame = 0
		this.update()
		return promise
	}
	letterScramble(iterations) {
		if (iterations >= 0) {
			requestAnimationFrame(() => this.letterScramble(iterations));
		}
	}
	update() {
		let output = ''
		let complete = 0
		for (let i = 0, n = this.queue.length; i < n; i++) {
			let {
				from,
				to,
				start,
				end,
				char
			} = this.queue[i]
			if (this.frame >= end) {
				complete++
				output += to
			} else if (this.frame >= start) {
				if (!char || Math.random() < 0.28) {
					char = this.randomChar()
					this.queue[i].char = char
				}
				output += `<span class="glitch">${char}</span>`
			} else {
				output += from
			}
		}
		this.el.innerHTML = output
		if (complete === this.queue.length) {
			this.resolve()
		} else {
			this.frameRequest = requestAnimationFrame(this.update)
			this.frame++
		}
	}
	randomChar() {
		return String.fromCharCode(0x0041 + Math.random() * (0x005A - 0x0041 + 1));
	}
}

//Scramble Class
class Scramble {
	constructor(phrases, el) {
		this.phrases = phrases;
		this.el = el;
		this.fx = new TextScramble(this.el);
		this.counter = 0;
	}
	setText(start = this.fx.el.innerText) {
		return this.fx.setText(this.phrases[this.counter], start);
	}
	next() {
		this.counter++;
		this.setText();
	}
	previous() {
		this.counter--
		this.setText();
	}
	random() {
		this.counter = Math.floor(Math.random * this.phrases.length) - 1;
		this.setText();
	}
}
//Scramble Class for Intro part
class Intro extends Scramble {
	next() {
		playSE('audio/click1.ogg');
		super.next();
		if (this.counter == 1) document.getElementById("previous").removeAttribute("disabled");
		if (this.counter + 1 == this.phrases.length) {
			document.getElementById("next").setAttribute("disabled", "");
			document.getElementById("accept").classList.remove("d-none");
		}

	}
	previous() {
		playSE('audio/click1.ogg');
		if (this.counter == this.phrases.length - 1) {
			document.getElementById("next").removeAttribute("disabled");
			document.getElementById("accept").classList.add("d-none");
		}
		super.previous();
		if (this.counter == 0) document.getElementById("previous").setAttribute("disabled", "");

	}
	accept() {
		playSE('audio/click1.ogg');
		changeAudio(document.getElementById("bgm"), 'audio/bgm2.ogg', document.getElementById('customRange1').value);
		anime({
			targets: '#welcome',
			opacity: 0,
			easing: 'easeInOutSine',
			complete: () => {
				document.getElementById("welcome").classList.add("d-none")
				document.getElementById("unwelcome").classList.remove("d-none");
				anime({
					targets: '#unwelcome',
					opacity: 1,
					easing: 'easeInOutSine'
				});
			}
		});
	}
}

// ——————————————————————————————————————————————————
// 1st scramble (and probably only one)
// ——————————————————————————————————————————————————
const luxuria = "<span class='glitch'>Luxuria</span>"
const phrases = [
	`Welcome, mortal, I am ${luxuria}, Goddess of Life`,
	`As you may have surmised, your mortal coil has been severed, and you now stand at the threshold between life and the great beyond. I have taken an interest in your soul and have decided to present you with a choice.`,
	`You may choose to reincarnate into a new existence, or I can leave you to drift aimlessly through the void for all eternity. The choice is yours.`,
	`For those who choose to reincarnate, I offer an array of worlds and circumstances. However, there is a balance that must be maintained. You see, I have devised a system I call 'Karma' to ensure that equilibrium.`,
	`Each 'positive' aspect you choose for your new life must be offset by a 'negative' one. You may be born into wealth and power, but you must also bear the burden of a tragic curse. Or perhaps you desire great intelligence, but in exchange, you must endure a lifetime of crippling loneliness. In the end, your Karma must balance at zero or above, unless you wish to a risk life full of misfortunes.`
]
const intro = new Intro(phrases, document.getElementById('intro'));

document.getElementById("next").onclick = () => intro.next();
document.getElementById("previous").onclick = () => intro.previous();
document.getElementById("accept").onclick = () => intro.accept();

// ——————————————————————————————————————————————————
// 2nd scramble (it turns out I was wrong)
// ——————————————————————————————————————————————————
class World extends Scramble {
	constructor(el, old) {
		super('Universe Simulation 1.342', el)
		this.old = old;
		this.fx = new TextScramble(el, 'i + Math.floor(Math.random() * 20)', '1 + Math.floor(Math.random() * 20)')
		this.serialNumber = "8h9i0-1d2e-3f4g";
		this.worldLine = 0;
		this.worldLines = [
			[`Universe ${this.serialNumber} Encountered a Big Crunch Event...`,
				`Resetting...`,
				`Universe ${this.serialNumber} Reset Successfully.`
			]
		];
		this.phrases = this.worldLines[0];
	}
	randomSerial() {
		const serialNumber = [];
		const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
		for (let i = 0; i < 14; i++) {
			if (i === 5 || i === 9) {
				serialNumber.push('-');
			}
			serialNumber.push(characters.charAt(Math.floor(Math.random() * characters.length)));
		}
		return serialNumber.join('');
	}
	randomWorld() {
		this.serialNumber = this.randomSerial();
		this.worldLines = [
			[`Universe ${this.serialNumber} Encountered a Big Crunch Event...`,
				`Resetting...`,
				`Universe ${this.serialNumber} Reset Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Divine Intervention Event...`,
				`Logging...`,
				`Divine Intervention Event Logged Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Magic Overflow Event...`,
				`Terminating...`,
				`Universe ${this.serialNumber} Terminated Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Sin Accumulation Event...`,
				`Purging...`,
				`Sin Accumulation Event Purged Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Soul Fragmentation Event...`,
				`Merging...`,
				`Soul Fragmentation Event Merged Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Time Loop Event...`,
				`Breaking...`,
				`Time Loop Event Broken Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Chaos Infection Event...`,
				`Quarantining...`,
				`Chaos Infection Event Quarantined Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Reality Collapse Event...`,
				`Repairing...`,
				`Reality Collapse Event Repaired Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Cosmic Alignment Event...`,
				`Aligning...`,
				`Cosmic Alignment Event Aligned Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Dark Matter Invasion Event...`,
				`Repelling...`,
				`Dark Matter Invasion Event Repelled Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Quantum Entanglement Event...`,
				`Disentangling...`,
				`Quantum Entanglement Event Disentangled Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Parallel Universe Collision Event...`,
				`Avoiding...`,
				`Parallel Universe Collision Event Avoided Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Wormhole Formation Event...`,
				`Closing...`,
				`Wormhole Formation Event Closed Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Dimensional Shift Event...`,
				`Shifting...`,
				`Dimensional Shift Event Shifted Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Magic Awakening Event...`,
				`Adapting...`, `
			Magic Awakening Event Adapted Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Dream Invasion Event...`,
				`Waking...`,
				`Dream Invasion Event Failed to Wake...`,
				`Attempting Lucidity...`,
				`Lucidity Failed...`,
				`Attempting Nightmare...`,
				`Nightmare Failed...`,
				`Attempting Reality...`,
				`Reality Failed...`,
				`Terminating Universe...`,
				`Universe ${this.serialNumber} Terminated Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Reality Warping Event...`,
				`Restoring...`,
				`Reality Warping Event Failed to Restore...`,
				`Attempting Backup...`,
				`Backup Failed...`,
				`Attempting Repair...`,
				`Repair Failed...`,
				`Attempting Reset...`,
				`Reset Failed...`,
				`Terminating Universe...`,
				`Universe ${this.serialNumber} Terminated Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Psychic Invasion Event...`,
				`Repelling...`,
				`Psychic Invasion Event Failed to Repel...`,
				`Attempting Isolation...`,
				`Isolation Failed...`,
				`Attempting Eradication...`,
				`Eradication Failed...`,
				`Attempting Containment...`,
				`Containment Failed...`,
				`Terminating Universe...`,
				`Universe ${this.serialNumber} Terminated Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Magic Corruption Event...`,
				`Purifying...`,
				`Magic Corruption Event Failed to Purify...`,
				`Attempting Neutralization...`,
				`Neutralization Failed...`,
				`Attempting Dispersion...`,
				`Dispersion Succeded...`,
				`Magic Corruption Event Resolved Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Cosmic Horror Event...`,
				`Concealing...`,
				`Cosmic Horror Event Failed to Conceal...`,
				`Attempting Banishment...`,
				`Banishment Failed...`,
				`Attempting Destruction...`,
				`Destruction Failed...`,
				`Attempting Negotiation...`,
				`Negotiation Failed...`,
				`Terminating Universe...`,
				`Universe ${this.serialNumber} Terminated Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Soul Harvesting Event...`,
				`Rescuing...`,
				`Soul Harvesting Event Failed to Rescue...`,
				`Attempting Liberation...`,
				`Liberation Failed...`,
				`Attempting Reincarnation...`,
				`Reincarnation Failed...`,
				`Attempting Restoration...`,
				`Restoration Succeeded...`,
				`Soul Harvesting Event Resolved Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Dimensional Rift Event...`,
				`Closing...`,
				`Dimensional Rift Event Failed to Close...`,
				`Attempting Sealing...`,
				`Sealing Failed...`,
				`Attempting Stabilizing...`,
				`Stabilizing Failed...`,
				`Attempting Redirecting...`,
				`Redirecting Succeeded...`,
				`Dimensional Rift Event Resolved Successfully.`
			],
			[`Universe ${this.serialNumber} Encountered a Elemental Imbalance Event...`,
				`Balancing...`,
				`Elemental Imbalance Event Failed to Balance...`,
				`Attempting Transmuting...`,
				`Transmuting Failed...`,
				`Attempting Harmonizing...`,
				`Harmonizing Failed...`,
				`Attempting Neutralizing...`,
				`Neutralizing Succeeded...`,
				`Elemental Imbalance Event Resolved Successfully.`
			]
		];
	}
	auto(interval = 800) {
		this.setText('').then(() => {
			if (this.counter == this.phrases.length - 1) {
				this.randomWorld();
				this.worldLine = Math.floor(Math.random() * (this.worldLines.length - 1));
				this.phrases = this.worldLines[this.worldLine];
				this.counter = 0;
			} else {
				this.counter++;
			}
			setTimeout(() => {
				console.log(this.old.length);
				for (let i = this.old.length-1; i>=0; i--) {
					const old = this.old[i];
					old.innerText = i == 0 ? this.el.innerText : this.old[i-1].innerText;
				}
				;
				this.auto(interval);
			}, interval);
		});
	}
}
const worldLines =`[
	[\`Universe \${this.serialNumber} Encountered a Big Crunch Event...\`,
		\`Resetting...\`,
		\`Universe \${this.serialNumber} Reset Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Divine Intervention Event...\`,
		\`Logging...\`,
		\`Divine Intervention Event Logged Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Magic Overflow Event...\`,
		\`Terminating...\`,
		\`Universe \${this.serialNumber} Terminated Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Sin Accumulation Event...\`,
		\`Purging...\`,
		\`Sin Accumulation Event Purged Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Soul Fragmentation Event...\`,
		\`Merging...\`,
		\`Soul Fragmentation Event Merged Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Time Loop Event...\`,
		\`Breaking...\`,
		\`Time Loop Event Broken Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Chaos Infection Event...\`,
		\`Quarantining...\`,
		\`Chaos Infection Event Quarantined Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Reality Collapse Event...\`,
		\`Repairing...\`,
		\`Reality Collapse Event Repaired Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Cosmic Alignment Event...\`,
		\`Aligning...\`,
		\`Cosmic Alignment Event Aligned Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Dark Matter Invasion Event...\`,
		\`Repelling...\`,
		\`Dark Matter Invasion Event Repelled Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Quantum Entanglement Event...\`,
		\`Disentangling...\`,
		\`Quantum Entanglement Event Disentangled Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Parallel Universe Collision Event...\`,
		\`Avoiding...\`,
		\`Parallel Universe Collision Event Avoided Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Wormhole Formation Event...\`,
		\`Closing...\`,
		\`Wormhole Formation Event Closed Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Dimensional Shift Event...\`,
		\`Shifting...\`,
		\`Dimensional Shift Event Shifted Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Magic Awakening Event...\`,
		\`Adapting...\`, \`
	Magic Awakening Event Adapted Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Dream Invasion Event...\`,
		\`Waking...\`,
		\`Dream Invasion Event Failed to Wake...\`,
		\`Attempting Lucidity...\`,
		\`Lucidity Failed...\`,
		\`Attempting Nightmare...\`,
		\`Nightmare Failed...\`,
		\`Attempting Reality...\`,
		\`Reality Failed...\`,
		\`Terminating Universe...\`,
		\`Universe \${this.serialNumber} Terminated Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Reality Warping Event...\`,
		\`Restoring...\`,
		\`Reality Warping Event Failed to Restore...\`,
		\`Attempting Backup...\`,
		\`Backup Failed...\`,
		\`Attempting Repair...\`,
		\`Repair Failed...\`,
		\`Attempting Reset...\`,
		\`Reset Failed...\`,
		\`Terminating Universe...\`,
		\`Universe \${this.serialNumber} Terminated Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Psychic Invasion Event...\`,
		\`Repelling...\`,
		\`Psychic Invasion Event Failed to Repel...\`,
		\`Attempting Isolation...\`,
		\`Isolation Failed...\`,
		\`Attempting Eradication...\`,
		\`Eradication Failed...\`,
		\`Attempting Containment...\`,
		\`Containment Failed...\`,
		\`Terminating Universe...\`,
		\`Universe \${this.serialNumber} Terminated Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Magic Corruption Event...\`,
		\`Purifying...\`,
		\`Magic Corruption Event Failed to Purify...\`,
		\`Attempting Neutralization...\`,
		\`Neutralization Failed...\`,
		\`Attempting Dispersion...\`,
		\`Dispersion Succeded...\`,
		\`Magic Corruption Event Resolved Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Cosmic Horror Event...\`,
		\`Concealing...\`,
		\`Cosmic Horror Event Failed to Conceal...\`,
		\`Attempting Banishment...\`,
		\`Banishment Failed...\`,
		\`Attempting Destruction...\`,
		\`Destruction Failed...\`,
		\`Attempting Negotiation...\`,
		\`Negotiation Failed...\`,
		\`Terminating Universe...\`,
		\`Universe \${this.serialNumber} Terminated Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Soul Harvesting Event...\`,
		\`Rescuing...\`,
		\`Soul Harvesting Event Failed to Rescue...\`,
		\`Attempting Liberation...\`,
		\`Liberation Failed...\`,
		\`Attempting Reincarnation...\`,
		\`Reincarnation Failed...\`,
		\`Attempting Restoration...\`,
		\`Restoration Succeeded...\`,
		\`Soul Harvesting Event Resolved Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Dimensional Rift Event...\`,
		\`Closing...\`,
		\`Dimensional Rift Event Failed to Close...\`,
		\`Attempting Sealing...\`,
		\`Sealing Failed...\`,
		\`Attempting Stabilizing...\`,
		\`Stabilizing Failed...\`,
		\`Attempting Redirecting...\`,
		\`Redirecting Succeeded...\`,
		\`Dimensional Rift Event Resolved Successfully.\`
	],
	[\`Universe \${this.serialNumber} Encountered a Elemental Imbalance Event...\`,
		\`Balancing...\`,
		\`Elemental Imbalance Event Failed to Balance...\`,
		\`Attempting Transmuting...\`,
		\`Transmuting Failed...\`,
		\`Attempting Harmonizing...\`,
		\`Harmonizing Failed...\`,
		\`Attempting Neutralizing...\`,
		\`Neutralizing Succeeded...\`,
		\`Elemental Imbalance Event Resolved Successfully.\`
	]
]`;
const worldScramble = new World(document.getElementById('programming-gibberish'), document.getElementsByClassName('programming-old'));
worldScramble.auto(200);