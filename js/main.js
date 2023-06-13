//Audio Handler
const playSE = (path) => {
	const audio = new Audio(path);
	audio.play();
	return audio;
}
const changeVolume = (audio, value) => {
	audio.volume = (value/100);
	return audio;
}
const fadeIn = (audio, endVolume = 100) => {
	endVolume = endVolume > 100 ? 100 : endVolume;
	return new Promise ((resolve) => {
		let volume = 0;
		audio.volume = 0;
		audio.play();
		let interval = setInterval ( () => {
			if (volume >= endVolume) {
				clearInterval (interval);
				resolve ();
			} else {
				volume += 1;
				changeVolume(audio, volume)
			}
	  	}, 10);
	});
}
const fadeOut = (audio) => {
	return new Promise ((resolve) => {
		let volume = Math.floor(audio.volume*100);
	  	let interval = setInterval ( () => {
			if (volume <= 0) {
				clearInterval (interval);
				audio.pause ();
				resolve ();
			} else {
				volume -= 1
				changeVolume(audio, volume);
			}
	  	}, 10);
	});
}
const changeAudio = (audio, path, endVolume) => {
	const promiseIn = fadeOut(audio);
	promiseIn.then(() => {
		audio.src = path;
		fadeIn(audio, endVolume)
		;});
	return audio;
}
//Set up Event Listeners
document.addEventListener('click', function firstInteraction() {
	fadeIn(document.getElementById('bgm'), document.getElementById('customRange1').value);
	document.removeEventListener('click', firstInteraction);
});
const choices = document.getElementsByClassName("choice");
for (let choice of choices) {
	choice.addEventListener("click", () => {setChoice(choice)}, false);
}
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
	playSE('audio/click.ogg');
	counter++;
	fx.setText(phrases[counter]);
	if (counter == 1) document.getElementById("previous").removeAttribute("disabled");
	if (counter + 1 == phrases.length) {
		document.getElementById("next").setAttribute("disabled", "");
		document.getElementById("accept").classList.remove("d-none");
	}
}
const previous = () => {
	playSE('audio/click.ogg');
	if (counter == phrases.length - 1) {
		document.getElementById("next").removeAttribute("disabled");
		document.getElementById("accept").classList.add("d-none");
	}
	counter--
	fx.setText(phrases[counter]);
	if (counter == 0) document.getElementById("previous").setAttribute("disabled", "");
}

const accept = () => {
	playSE('audio/click.ogg');
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

//Karma System

let karma = 0;
const setKarma = (number) => {
	karma = number;
	pointBar = document.getElementById("karma");
	pointBar.innerText = `Karma: ${karma}`;
}
//Hide n Unhide
const hideHandler = () => {
	const elements = document.querySelectorAll('[data-reveals]');
	for (let element of elements){
		let active = false;
		const ids = element.getAttribute('data-reveals').split(', ');
		for (let id of ids) {
			const el = document.getElementById(id);
			if (el.classList.contains('active-choice')){
				active = true;
				break;
			}
		}
		if (active && element.classList.contains('d-none')){
			element.classList.remove('d-none');
		} else if (!active && !element.classList.contains('d-none')){
			element.classList.add('d-none');
		}
	}
}
//conflict and requirements handler
const conreq = (element) => {
	const requires = element.dataset.requires ? JSON.parse(element.dataset.requires) : undefined;
	const conflicts = element.dataset.conflicts ? JSON.parse(element.dataset.conflicts) : undefined;
	if (conflicts){
		for (let conflict of conflicts){
			if (document.getElementById(conflict).classList.contains("active-choice")){
				playSE('audio/error.ogg');
				alert('Conflicting Choices Detected');
				return true;
			}		
		}
		
	}
	if (requires){
		for (let require of requires){
			if (!document.getElementById(require).classList.contains("active-choice")){
				playSE('audio/error.ogg');
				alert('You do not meet requirements for this choice');
				return true;
			}		
		}
	}
	return false;
}
//choice handler
const setChoice = (element) => {
	let grandParent = element.parentElement.parentElement;
	let siblings = grandParent.children;
	let count = 0;
	let stop = false;
	let value = 0;
	const limit = element.dataset.limit ? parseInt(element.dataset.limit) : 1;
	for (let sibling of siblings) {
		if (sibling.firstElementChild.classList.contains("active-choice")) count++;
		if (count == limit) {
			stop = true;
			break;
		}
	}
	if (conreq(element)) return;
	if (element.classList.contains("active-choice")){
		playSE('audio/click2.ogg');
		value = -parseInt(element.dataset.karma);
		element.classList.remove("active-choice");
	} else {
		if (stop) {
			for (let sibling of siblings) {
				if (sibling.firstElementChild.classList.contains("active-choice")) {
					sibling.firstElementChild.classList.remove("active-choice");
					value = parseInt(sibling.firstElementChild.dataset.karma)
					setKarma(karma-value);
					break;
				}
			}
		}
		playSE('audio/click.ogg');
		value = parseInt(element.dataset.karma)
		element.classList.add("active-choice");
	}
	setKarma(karma+value);
	hideHandler();
}
