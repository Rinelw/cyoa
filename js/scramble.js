// Intro
class TextScramble {
	constructor(el) {
		this.el = el
		this.last = 0;
		this.update = this.update.bind(this)
	}
	setText(newText) {
		const oldText = this.el.innerText
		const length = Math.max(oldText.length, newText.length)
		const promise = new Promise((resolve) => this.resolve = resolve)
		this.queue = []
		for (let i = 0; i < length; i++) {
			const from = oldText[i] || ''
			const to = newText[i] || ''
			const start = Math.floor(Math.random() * 40)
			const end = start + Math.floor(Math.random() * 40)
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

const el = document.querySelector('.intro');
const fx = new TextScramble(el);
document.getElementById("next")
document.getElementById("previous")

let counter = 0;
const next = () => {
	playSE('audio/click1.ogg');
	counter++;
	fx.setText(phrases[counter]);
	if (counter == 1) document.getElementById("previous").removeAttribute("disabled");
	if (counter + 1 == phrases.length) {
		document.getElementById("next").setAttribute("disabled", "");
		document.getElementById("accept").classList.remove("d-none");
	}
}
const previous = () => {
	playSE('audio/click1.ogg');
	if (counter == phrases.length - 1) {
		document.getElementById("next").removeAttribute("disabled");
		document.getElementById("accept").classList.add("d-none");
	}
	counter--
	fx.setText(phrases[counter]);
	if (counter == 0) document.getElementById("previous").setAttribute("disabled", "");
}

const accept = () => {
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