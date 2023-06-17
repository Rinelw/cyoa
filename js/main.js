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

//Points System

let points = 0;
const updatePoints = (number) => {
	let pointBar = document.getElementById("points");
	pointBar.classList.remove('positive', 'negative');
	if (number !== 0) pointBar.classList.add(number > 0 ? 'positive' : 'negative');
	pointBar.innerText = `${number}`;
}
const setPoints = (number) => {
	points = number;
	updatePoints(number);
}
const subPoints = (number) => {
	points -= number;
	updatePoints(points);
}
const addPoints = (number) => {
	points += number;
	updatePoints(points);
}
//Hide n Reveal
const hideHandler = () => {
	const elements = document.querySelectorAll('[data-reveals], [data-hides]');
	for (let element of elements) {
		let active = false;
		let hidden = false;
		const revealID = element.dataset.reveals ? element.dataset.reveals.split(', ') : [];
		const hideID = element.dataset.hides ? element.dataset.hides.split(', ') : [];
		const combinedID = new Set([...revealID, ...hideID]);
		for (let id of combinedID) {
			const controller = document.getElementById(id);
			const category = controller.classList.contains('choice') ? controller.parentElement.parentElement.parentElement.parentElement : undefined;
			const hides = hideID.includes(controller.id);
			const reveals = revealID.includes(controller.id);
			const isActive = controller.classList.contains('active-choice');
			const isHidden = (!category) ? category.classList.contains('d-none') : true;
			active = (reveals && isActive) || !isHidden || active
			hidden = (hides && isActive)
			if (hidden || (active && hideID === [])) {
				break;
			}
		}
		if (active && element.classList.contains('d-none') && !hidden){
			element.classList.remove('d-none');
		} else if ((!active && !element.classList.contains('d-none')) || hidden){
			element.classList.add('d-none');
		}
	}
}
const choiceDeactivator = (element) => {
	if (element.classList.contains("active-choice")){
		let value = parseInt(element.dataset.points);
		element.classList.remove("active-choice");
		subPoints(value);
		return true;
	} else
	return false;
}
const choiceActivator = (element) => {
	if (!element.classList.contains("active-choice")){
		let value = parseInt(element.dataset.points);
		element.classList.add("active-choice");
		addPoints(value);
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
	if (last === 'and' || last === 'xor' || last === 'or'){
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
				break;
			case 'xor':
				if (document.getElementById(require).classList.contains("active-choice"))
				active++;
				if (active > 1)
				return false;
				break;
			case 'or':
				if (document.getElementById(require).classList.contains("active-choice"))
				return true;
				break;
			default:
				break;
		}
	}
	return !(last === 'or' || (last === 'xor' && active === 0));
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
const conReq = (element) => {
	return (!conflictChecker(element) && requirementChecker(element));
}

//choice handler
const setChoice = (element) => {
	let grandParent = element.parentElement.parentElement;
	let container = grandParent.parentElement.parentElement;
	let siblings = grandParent.children;
	let count = 0;
	let stop = false;
	const limit = container.dataset.limit ? parseInt(container.dataset.limit) : 1;
	if (limit !== 0)
	for (let sibling of siblings) {
		if (sibling.firstElementChild.classList.contains("active-choice")) count++;
		if (count === limit) {
			stop = true;
			break;
		}
	}
	if (!conReq(element)) {
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
const setupCosts = () => {
	const elements = document.getElementsByClassName('points');
	for (let element of elements) {
		const grandParent = element.parentElement.parentElement;
		if (!grandParent.classList.contains('choice')) continue;
		const cost= parseInt(grandParent.dataset.points);
		const absoluteCost = Math.abs(cost)
		if (cost !== 0) {
			element.classList.add(cost > 0 ? 'positive' : 'negative')
			element.innerText = cost > 0 ? `+${absoluteCost} Karma` : `-${absoluteCost} Karma`
		} else {
			element.innerText = `${absoluteCost} Karma`;
		}
	}
}
setupCosts();