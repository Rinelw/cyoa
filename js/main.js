//Audio Handler
let seVolume = 50;
let bgmVolume = 50;
const bgm = new Audio('audio/bgm1.ogg');
bgm.loop = true;
const playSE = (path, volume = 100) => {
	const audio = new Audio(path);
	audio.volume = (volume/100);
	audio.play().then();
	return audio;
}
const changeVolume = (audio, value) => {
	audio.volume = (value/100);
	return audio;
}
changeVolume(bgm, bgmVolume);
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
	fadeIn(bgm, document.getElementById('customRange1').value);
	document.removeEventListener('click', firstInteraction);
});
const choices = document.getElementsByClassName("choice");
for (let choice of choices) {
	choice.addEventListener("click", () => {setChoice(choice)}, false);
}

//Points System
class Point {
	constructor(name = '', value = 0) {
		this.value = value;
		this.name = name;
		this.prefix = ''
	}
	updatePoints = (number) => {
		const pointBar = document.getElementById(this.name).querySelector('span');
		if (!pointBar) return;
		pointBar.classList.remove('positive', 'negative');
		if (number !== 0) pointBar.classList.add(number > 0 ? 'positive' : 'negative');
		pointBar.textContent = `${number}`;
	}
	setPoints = (number) => {
		this.value = number;
		this.updatePoints(number);
	}
	subPoints = (number) => {
		this.value -= number;
		this.updatePoints(this.value);
	}
	addPoints = (number) => {
		this.value += number;
		this.updatePoints(this.value);
	}
	setCosts = (cost = 0, element) => {
		const absoluteCost = Math.abs(cost);
		if (cost !== 0) {
			element.classList.add(cost > 0 ? 'positive' : 'negative')
			element.textContent = cost > 0 ? `+${absoluteCost} ${this.name}` : `-${absoluteCost} ${this.name}`
		} else {
			element.classList.remove('positive', 'negative')
			element.textContent = `${absoluteCost} ${this.name}`;
		}
	}
	#getPoints = (element, attribute) => {
		return element.getAttribute(attribute) ? parseInt(element.getAttribute(attribute)) : 0;
	}
	#setupBackpack = () => {
		const backpack = document.getElementById("backpack");
		const container = backpack.appendChild(document.createElement("div"));
		container.classList.add("col");
		container.setAttribute("id", this.name);
		const title = container.appendChild(document.createElement("h4"));
		title.classList.add("backpack-title");
		const points = container.appendChild(document.createElement("span"));
		points.textContent = "0";
		points.classList.add("fs-4");
	}
	#setupCosts = () => {
		const elements = document.getElementsByClassName('choice');
		for (let element of elements) {
			const cost= this.#getPoints(element, `data-${this.name.toLowerCase()}`);
			const pointsSpan = element.querySelector('.points');
			this.setCosts(cost, pointsSpan);
		}
	}
	changePrefix = (prefix = '') => {
		this.prefix = prefix;
		const points = document.getElementById(this.name).querySelector('.backpack-title');
		points.textContent = `${this.prefix + ' ' + this.name.charAt(0).toUpperCase() + this.name.slice(1)}:`;
	}
	setup() {
		this.#setupBackpack();
		this.#setupCosts();
		this.changePrefix();
	}
	modifyCosts = (element, isPositive = true) => {
		const dataModifier = this.#getPoints(element, element.getAttribute(`data-${this.name.toLowerCase()}-mod`));
		const costModifiers = dataModifier === 0 ? undefined : dataModifier;
		if (costModifiers === undefined) return;
		for (let modifier of costModifiers) {
			const modId = modifier.split(' ');
			if (modId.length > 1) {
				const costMod = isPositive ? parseInt(modId.shift()) : -parseInt(modId.shift()) ;
				for (let id of modId) {
					const target = document.getElementById(id).querySelector('h4');
					const initialPoints = this.getPoints(target, `data-${this.name.toLowerCase()}`);
					const modifiedPoints = initialPoints + costMod;
					target.setAttribute(`data-${this.name.toLowerCase()}`, `${modifiedPoints}`);
					const pointsSpan = target.querySelector('.points');
					this.setCosts(points, pointsSpan);
					if (target.classList.contains("active-choice")){
						this.addPoints(costMod);
					}
				}
			}
		}
	}
}
class Bank {
	constructor(vault = []) {
		this.names = vault;
		this.vault = [];
		this.currencySetup();
	}
	currencySetup() {
		for (let i = 0; i < this.names.length; i++) {
			this.vault[i] = new Point(this.names[i]);
		}
	}
}
const backpack = new Bank(['karma']);
const karma = backpack.vault[0];
karma.setup();
karma.changePrefix('Current:')
let points = 0;
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
			if (!controller) continue;
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
		karma.modifyCosts(element, false);
		let value = parseInt(element.dataset.points);
		element.classList.remove("active-choice");
		karma.subPoints(value);
		return true;
	} else
	return false;
}
const choiceActivator = (element) => {
	if (!element.classList.contains("active-choice")){
		karma.modifyCosts(element, true);
		let value = parseInt(element.dataset.points);
		element.classList.add("active-choice");
		karma.addPoints(value);
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
	const regEx = new RegExp(/\b(?:xor|or|and)\b/);
	if (regEx.test(last)){
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
//false when there are conflicts and requirements are not met, true when there aren't any conflicts and requirements are met
const conReq = (element) => {
	return (!conflictChecker(element) && requirementChecker(element));
}
const requireDeactivator = (disabledElement) => {
	if (!disabledElement) return false;
	const elements = document.querySelectorAll(`[data-requires*="${disabledElement.id}"], [data-conflicts*="${disabledElement.id}"]`);
	if (elements.length === 0) return false;
	for (let element of elements) {
		if (conflictChecker(element) && requirementChecker(element)){
		} else {
			if (element.classList.contains('active-choice')){
				choiceDeactivator(element);
				requireDeactivator(element);
			}
		}
	}
}

const choiceDisabler = () => {
	const elements = document.querySelectorAll('[data-requires], [data-conflicts]');
	for (let element of elements){
		if (!conReq(element))
			element.classList.add('disabled-choice')
		else
			element.classList.remove('disabled-choice')
	}
}
//choice handler
const setChoice = (element) => {
	if (!conReq(element)) {
		playSE('audio/error.ogg', seVolume);
		return;
	}
	const grandParent = element.parentElement.parentElement;
	const container = grandParent.parentElement.parentElement;
	const siblings = grandParent.children;
	const activeSiblings = grandParent.querySelectorAll('.active-choice');
	const count = siblings.length;
	let stop = false;
	const limit = container.dataset.limit ? parseInt(container.dataset.limit) : 1;
	if (count >= limit && limit !== 0) stop = true;
	if (choiceDeactivator(element)) {
		requireDeactivator(element);
		playSE('audio/click2.ogg', seVolume);
	}
	else {
		let nephew
		if (stop && activeSiblings.length >= limit) {
			for (let sibling of siblings) {
				nephew = sibling.firstElementChild
				if (choiceDeactivator(nephew)) {
					requireDeactivator(nephew);
					break;
				}
			}
		}
		choiceActivator(element);
		playSE('audio/click1.ogg', seVolume);
	}
	choiceDisabler();
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
const setupRequirements = () => {
	const conElements = document.getElementsByClassName('conflicts');
	const reqElements = document.getElementsByClassName('requires');
	const stringGenerator = (ids) => {
		const idArray = ids.split(', ');
		let result = "";
		for (let id of idArray) {
			const grandChild = document.getElementById(id).firstElementChild.firstElementChild;
			result += grandChild.textContent + ', ';
		}
		result = result.substring(0, result.length-2);
		return result;
	}
	const stringWriter = (elements, isConflict = false) => {
		for (let element of elements) {
			const grandParent = element.parentElement.parentElement;
			if (!grandParent.classList.contains('choice')) continue;
			let dataset = isConflict ? grandParent.dataset.conflicts : grandParent.dataset.requires;
			let dataString;
			if (dataset !== undefined) {
				dataset = dataset.replace(/\b(?:, xor|, or|, and)\b/, '');
				dataString = stringGenerator(dataset);
				element.innerHTML = isConflict ? `<span class="conflicts">Conflicts: </span><span>${dataString}</span>` : `<span class="requires">Requires: </span><span>${dataString}<br></span>`
			}
		}
	}
	stringWriter(conElements, true);
	stringWriter(reqElements,false);
}
choiceDisabler();
setupRequirements();