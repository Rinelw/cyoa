//Audio Handler
const playSE = (path, volume = 100) => {
	const audio = new Audio(path);
	audio.volume = (volume/100);
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

//Karma System

let karma = 0;
const updateKarma = (number) => {
	pointBar = document.getElementById("karma");
	pointBar.innerText = `Karma: ${number}`;
}
const setKarma = (number) => {
	karma = number;
	updateKarma(number);
}
const subKarma = (number) => {
	karma -= number;
	updateKarma(karma);
}
const addKarma = (number) => {
	karma += number;
	updateKarma(karma);
}
//Hide n Unhide
const hideHandler = () => {
	const elements = document.querySelectorAll('[data-reveals]');
	for (let element of elements){
		let active = false;
		const ids = element.dataset.reveals.split(', ');
		for (let id of ids) {
			const el = document.getElementById(id);
			if (el.classList.contains('active-choice') && !el.parentElement.parentElement.parentElement.parentElement.classList.contains('d-none')){
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
const choiceDeactivator = (element) => {
	if (element.classList.contains("active-choice")){
		let value = parseInt(element.dataset.karma);
		element.classList.remove("active-choice");
		subKarma(value);
		return true;
	} else
	return false;
}
const choiceActivator = (element) => {
	if (!element.classList.contains("active-choice")){
		let value = parseInt(element.dataset.karma);
		element.classList.add("active-choice");
		addKarma(value);
		return true;
	} else
	return false;
}

//conflict and requirements handler

// false when no conflicts and true when conflicts found
const conflictChecker = (element) => {
	const conflicts = element.dataset.conflicts ? element.dataset.conflicts.split(', ') : undefined;
	if (!conflicts) return false;
	for (let conflict of conflicts){
		if (document.getElementById(conflict).classList.contains("active-choice")){
			return true;
		}		
	}	
	return false;
}
// True when requirements are met and false when they aren't
const requirementChecker = (element) => {
	const requires = element.dataset.requires ? element.dataset.requires.split(', ') : undefined;
	if (!requires) return true;
	let last = requires[requires.length-1]
	if (last == 'and' || last == 'xor' || last == 'or'){
		last = requires.pop();
	} else {
		last = 'or';
	}
	let active = 0;
	for (let require of requires){
		switch (last){
			case 'and':
				if (!document.getElementById(require).classList.contains("active-choice"))
				return false;
			case 'xor':
				if (document.getElementById(require).classList.contains("active-choice"))
				active++;
				if (active > 1)
				return false;
			case 'or':
				if (document.getElementById(require).classList.contains("active-choice"))
				return true;
			default:
				console.log(last);
				break;
		}
	}
	if (last == 'or' || (last == 'xor' && active == 0)) {
		return false;
	} else {
		return true;
	}
}
const requireDeactivator = (disabledElement) => {
	if (!disabledElement) return false;
	const elements = document.querySelectorAll(`[data-requires*="${disabledElement.id}"]`);
	if (!elements) return false;
	for (let element of elements) {
		if (requirementChecker(element)){
		} else {
			requireDeactivator(element);
			choiceDeactivator(element);
		}
	}
}
//false when there are conflicts and requirements are not met, true when there aren't any conflicts and requirements are met
const conreq = (element) => {
	return (!conflictChecker(element) && requirementChecker(element));
}

//choice handler
const setChoice = (element) => {
	let grandParent = element.parentElement.parentElement;
	let container = grandParent.parentElement.parentElement;
	let siblings = grandParent.children;
	let count = 0;
	let stop = false;
	let value = 0;
	const limit = container.dataset.limit ? parseInt(container.dataset.limit) : 1;
	if (limit != 0)
	for (let sibling of siblings) {
		if (sibling.firstElementChild.classList.contains("active-choice")) count++;
		if (count == limit) {
			stop = true;
			break;
		}
	}
	if (!conreq(element)) {
		playSE('audio/error.ogg');
		return;
	}
	const deactivated = choiceDeactivator(element);
	if (!deactivated){
		let nephew
		if (stop) {
			for (let sibling of siblings) {
				const deactivated = choiceDeactivator(sibling.firstElementChild);
				if (deactivated) {
					nephew = sibling.firstElementChild
					break;
				}
			}
		}
		choiceActivator(element);
		requireDeactivator(nephew);
		playSE('audio/click1.ogg');
	} else {
		requireDeactivator(element);
		playSE('audio/click2.ogg');
	}
	
	hideHandler();
}
const programming = document.getElementsByClassName('programming-old');
let margin = 1.2;
let color = 0xffffffaa;
for (let i = 0; i < programming.length; i++) {
	programming[i].style= `margin-bottom: ${margin}rem !important; color: #${color.toString(16)} !important`;
	margin += 0.9;
	color -= 0x33;
}