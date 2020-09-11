'use strict'

const D = document,
	W = window,
	M = Math,
	lerp = (a, b, t) => (1 - t) * a + t * b,
	lerpd = (a, b, t, d) => lerp(a, b, M.min(1, t / d)),
	setBackground = (color) => D.documentElement.style.background = color,
	ticker = {},
	labels = {
		you: '<span class="You">You:</span>',
		jevgeni: '<span class="Jevgeni">Jevgeni:</span>',
		groundControl: '<span class="GroundControl">Ground Control:</span>',
	},
	convs = {
		jevgeni: {
			before: [
				{
					text: () => state.everythingOkay
						? null
						: 'Everything okay back there?',
					action: () => {
						state.everythingOkay = true
						setTicker([
							`${labels.jevgeni} It's a bit tight, but at least I have a window.`,
						])
					},
				},
				{
					text: () => state.onCourse
						? null
						: 'Are we still on course?',
					action: () => {
						state.onCourse = true
						setTicker([
							`${labels.jevgeni} Of course are we on course. Is this a trick question?`,
						], () => dialog(convs.jevgeni.course))
					},
				},
				{
					text: () => 'Would you please stop farting?',
					action: () => setTicker([
						`${labels.jevgeni} This was the last one. Promise.`
					]),
				},
			],
			course: [
				{
					text: () => 'No, just controlling our parameters like good Cosmonauts should do.',
					action: () => setTicker([
						`${labels.jevgeni} Well, then, yes, we are still on course, of course.`,
					]),
				},
				{
					text: () => 'Comrade, I need an answer.',
					action: () => setTicker([
						`${labels.jevgeni} Yes, comrade, we are still on course.`,
					]),
				},
			],
			nowhere: [
				{
					text: () => 'Do you see anything out there?',
					action: () => setTicker([
						`${labels.jevgeni} No, nothing at all, it's all totally black…`,
					]),
				},
			],
		},
		groundControl: {
			before: [
				{
					text: () => state.requestCode
						? 'What number was it?'
						: 'In position, ready to start the experimental drive.',
					action: () => {
						state.requestCode = true
						setTicker([
							`${labels.groundControl} Input 404 - I repeat 404 - into the control panel and start the drive.`,
						])
					}
				},
				{
					text: () => 'Jevgeni is a bio hazard.',
					action: () => setTicker([
						`${labels.jevgeni} You're exaggerating.`,
						`${labels.groundControl} Focus, Comrade!`,
					]),
				},
			],
		}
	},
	scenes = {
		opening: {
			setup: function() {
				setBackground('#111')
				this.startX = centerX - 75
				this.startY = centerY - 75
				this.stopX = centerX - 25
				this.stopY = centerY - 25
				this.startTime = Date.now()
				this.duration = setTicker([
					'A secret mission…',
					'bla bla',
				], () => setupScene('insideSoyuz'))
				show(this, [objects.earth, objects.soyuz])
			},
			draw: function(now) {
				const t = now - this.startTime,
					d = this.duration,
					x = lerpd(this.startX, this.stopX, t, d),
					y = lerpd(this.startY, this.stopY, t, d)
				objects.soyuz.style.transform =
					`translate(${x}px, ${y}px) rotateZ(45deg)`
			},
		},
		insideSoyuz: {
			setup: function() {
				setBackground('#3d4532')
				setHotspot(
					hotspots.porthole,
					'Look outside',
					() => setupScene('portholeEarth')
				)
				hotspots.porthole.style = `fill: ${state.nowhere
					? '#111'
					: '#0a8cc8'}; stroke-width: 2px; stroke: #cacbcf;`
				setHotspot(
					hotspots.jevgeni,
					'Talk to Jevgeni',
					() => dialog(state.nowhere
						? convs.jevgeni.nowhere
						: convs.jevgeni.before
					)
				)
				setHotspot(
					hotspots.hatch,
					'Go for a space walk',
					() => state.nowhere
						? setupScene('nowhere')
						: setTicker([
							`${labels.jevgeni} Not yet, we have a mission, comrade!`,
						])
				)
				setHotspot(
					hotspots.radio,
					'Talk to ground control',
					() => state.nowhere
						? setTicker([
							`zzz…`,
							`${labels.jevgeni} No contact… I guess we've got to help ourselves!`,
						])
						: dialog(convs.groundControl.before)
				)
				setHotspot(
					hotspots.controls,
					'Use the controls',
					() => setupScene('panel'),
				)
				setHotspot(
					hotspots.storage1,
					'Look into storage space one',
					() => setTicker(['A couple of space suits.'])
				)
				setHotspot(
					hotspots.storage2,
					'Look into storage space two',
					() => setTicker(['Proviant, adhesive tape and a towel.'])
				)
				setHotspot(
					hotspots.innerHatch,
					'Inner hatch',
					() => setTicker([state.nowhere
						? `${labels.you} That won't help.`
						: `${labels.jevgeni} Don't lock me up!`
					])
				)
				show(this, [
					objects.soyuzInside,
					objects.cosmonaut1Floating,
					objects.cosmonaut2Floating,
				])
			},
			draw: function(now) {
				const f = M.sin(now * .002) * 2,
					y = centerY - 60
				objects.cosmonaut1Floating.style.transform =
					`translate(${centerX}px, ${y + f}px) scale(1.25)`
				objects.cosmonaut2Floating.style.transform =
					`translate(${centerX - 162}px, ${y - f}px) scale(1.25)`
			},
		},
		portholeEarth: {
			setup: function() {
				setBackground('#111')
				setHotspot(
					hotspots.stopLooking,
					'Stop looking out the window',
					() => setupScene('insideSoyuz')
				)
				const o = [objects.porthole]
				if (!state.nowhere) {
					o.unshift(objects.earth)
					if (!state.aboveAfrica) {
						state.aboveAfrica = true
						setTicker([`${labels.jevgeni} Above Africa…`])
					}
				} else {
					setTicker([`${labels.jevgeni} Where's the earth?`])
				}
				show(this, o)
			},
		},
		nowhere: {
			setup: function() {
				setBackground('#111')
				state.nowhere = true
				const o = [objects.soyuz]
				if (state.arrivedInNowhere) {
					o.push(objects.cosmonaut)
					this.showCosmonaut = true
					setHotspot(
						hotspots.soyuzBody,
						'Get back inside',
						() => setupScene('insideSoyuz')
					)
					if (!state.outInNowhereBefore) {
						state.outInNowhereBefore = true
						setTicker([
							`${labels.you} Where are the stars?`,
							`${labels.you} Where is everything?`,
							`${labels.you} WHERE ARE WE?`,
						])
					}
				} else {
					this.showCosmonaut = false
					state.arrivedInNowhere = true
					setTicker([
						`${labels.you} What happened? Where's the earth??`,
					], () => setupScene('insideSoyuz'))
				}
				show(this, o)
			},
			draw: function(now) {
				const s = M.sin(now * .002),
					cy = centerY - 30 + s,
					sy = centerY - 50 - s
				objects.soyuz.style.transform =
					`translate(${centerX - 50}px, ${sy}px) rotateZ(12deg)`
				if (this.showCosmonaut) {
					objects.cosmonaut.style.transform =
						`translate(${centerX + 20}px, ${cy}px) scale(.2)`
				}
			},
		},
		library: {
			setup: function() {
				setBackground('#2b1f89')
				setHotspot(
					hotspots.goToInfirmaryRight,
					'Go to infirmary',
					() => setupScene('infirmary')
				)
				const y = centerY - 20
				objects.professor.style.transform =
					`translate(${centerX - 20}px, ${y}px)`
				objects.boris.style.transform =
					`translate(${centerX - 140}px, ${y}px)`
				show(this, [
					objects.library,
					objects.professor,
					objects.boris,
				])
			},
		},
		infirmary: {
			setup: function() {
				setBackground('#2b1f89')
				setHotspot(
					hotspots.goToLibrary,
					'Go to library',
					() => setupScene('library')
				)
				setHotspot(
					hotspots.goToConstruction,
					'Go to construction',
					() => setupScene('construction')
				)
				const y = centerY - 20
				objects.nurse.style.transform =
					`translate(${centerX + 30}px, ${y}px)`
				objects.boris.style.transform =
					`translate(${centerX - 125}px, ${y - 5}px)`
				show(this, [
					objects.infirmary,
					objects.nurse,
					objects.boris,
				])
			},
		},
		construction: {
			setup: function() {
				setBackground('#2b1f89')
				setHotspot(
					hotspots.goToInfirmaryLeft,
					'Go to infirmary',
					() => setupScene('infirmary')
				)
				const y = centerY - 25
				objects.technician.style.transform =
					`translate(${centerX - 60}px, ${y}px)`
				objects.boris.style.transform =
					`translate(${centerX + 25}px, ${y - 5}px) scaleX(-1)`
				show(this, [
					objects.construction,
					objects.technician,
					objects.boris,
				])
			},
		},
		panel: {
			setup: function() {
				state.value = state.value || 400
				hotspots.value.innerHTML = state.value
				setBackground('#a9a9a9')
				setHotspot(
					hotspots.reset,
					'Back',
					() => setupScene('insideSoyuz')
				)
				setHotspot(
					hotspots.plus,
					'Increase',
					() => {
						hotspots.value.innerHTML = ++state.value
					})
				setHotspot(
					hotspots.minus,
					'Decrease',
					() => {
						state.value = M.max(0, state.value - 1)
						hotspots.value.innerHTML = state.value
					})
				setHotspot(
					hotspots.start,
					'Start',
					() => {
						if (state.nowhere) {
							setTicker([
								`${labels.jevgeni} We probably should find out what has gone wrong first.`,
							])
						} else if (state.value != 404) {
							setTicker([
								`${labels.jevgeni} This doesn't look right…`,
							])
						} else {
							setupScene('nowhere')
						}
					}
				)
				show(this, [objects.panel])
			},
		},
	}

let animationRequestId,
	centerX,
	centerY,
	stageWidth,
	stageHeight,
	stage,
	objects,
	hotspots,
	message,
	currentScene,
	elementUnderPointer,
	inDialog = false,
	state = {
		scene: 'opening',
		nowhere: false,
	}

function setHotspot(hotspot, message, f) {
	hotspot.message = message
	hotspot.action = f
}

function show(scene, list) {
	for (let key in objects) {
		objects[key].style.visibility = 'hidden'
	}
	list.forEach((o) => o.style.visibility = 'visible')
	scene.draw(Date.now())
}

function clear() {
	message.style.display = 'none'
}

function showMessage(html) {
	message.innerHTML = html
	message.style.display = 'block'
}

function setTicker(messages, runAfter) {
	ticker.runAfter = runAfter
	ticker.messages = messages.map(function(text) {
		return {
			text: text,
			duration: 1000 + 200 * text.split(' ').length
		}
	})
	ticker.pointer = 0
	const m = ticker.messages[ticker.pointer]
	ticker.nextTick = Date.now() + m.duration
	showMessage(m.text)
	inDialog = true
	return ticker.messages.reduce((total, m) => total + m.duration, 0)
}

function dialog(conversation) {
	inDialog = true
	message.innerText = ''
	const ul = D.createElement('ol')
	conversation.map(function(option) {
		const text = option.text()
		if (text) {
			const li = D.createElement('li'),
				a = D.createElement('a')
			a.onclick = option.action
			a.innerHTML = text
			li.appendChild(a)
			ul.appendChild(li)
		}
	})
	message.appendChild(ul)
	message.style.display = 'block'
}

function resetTicker() {
	ticker.runAfter = ticker.messages = null
	ticker.pointer = 0
	inDialog = false
	clear()
}

function tickNext(now) {
	++ticker.pointer
	if (ticker.pointer >= ticker.messages.length) {
		const f = ticker.runAfter
		resetTicker()
		f && f()
		return
	}
	const m = ticker.messages[ticker.pointer]
	ticker.nextTick = now + m.duration
	showMessage(m.text)
}

function tick(now) {
	if (!ticker.messages) {
		return
	}
	if (now > ticker.nextTick) {
		tickNext(now)
	}
}

function setupScene(name) {
	for (let key in hotspots) {
		hotspots[key].message = null
	}
	resetTicker()
	state.scene = name
	currentScene = scenes[name]
	currentScene.setup()
}

function run() {
	animationRequestId = requestAnimationFrame(run)
	const now = Date.now()
	currentScene.draw(now)
	tick(now)
}

function scale(ratio, pivotX, pivotY) {
	const f = 100 * ratio * .5,
		x = pivotX || centerX - f,
		y = pivotY || centerY - f
	return `translate(${x}px, ${y}px) scale(${ratio})`
}

function resize() {
	if (animationRequestId) {
		cancelAnimationFrame(animationRequestId)
	}

	const windowWidth = window.innerWidth,
		windowHeight = window.innerHeight,
		min = M.min(windowWidth, windowHeight),
		ratio = min / 300

	stageWidth = windowWidth / ratio
	stageHeight = windowHeight / ratio
	centerX = stageWidth * .5
	centerY = stageHeight * .5

	const style = stage.style
	style.width = stageWidth + 'px'
	style.height = stageHeight + 'px'
	style.transformOrigin = 'top left'
	style.transform = `scale(${ratio})`
	style.display = 'block'

	const scale3 = scale(3),
		center = '50px 50px'
	objects.earth.style.transform = scale(5)
	objects.soyuz.style.transformOrigin = center
	objects.soyuzInside.style.transform = scale3
	objects.porthole.style.transform = scale3
	objects.library.style.transform = scale3
	objects.infirmary.style.transform = scale3
	objects.construction.style.transform = scale3
	objects.boris.style.transformOrigin = center
	objects.panel.style.transform = scale3

	currentScene.setup()
	run()
}

function findElementByPosition(event) {
	let x, y
	const touches = event.touches
	if (touches) {
		const l = touches.length
		for (let i = l; i--;) {
			const t = touches[i]
			x = t.pageX
			y = t.pageY
			break
		}
	} else {
		x = event.pageX
		y = event.pageY
	}
	return D.elementFromPoint(x, y)
}

function pointerInspect(event) {
	if (!inDialog) {
		elementUnderPointer = findElementByPosition(event)
		if (elementUnderPointer && elementUnderPointer.message) {
			showMessage(elementUnderPointer.message)
		} else {
			clear()
		}
	}
	event.stopPropagation()
}

function pointerInteract(event) {
	if (!inDialog) {
		if (elementUnderPointer && elementUnderPointer.action) {
			elementUnderPointer.action()
		}
	} else if (ticker.messages) {
		tickNext(Date.now())
	}
	event.stopPropagation()
}

function pointerCancel(event) {
	event.stopPropagation()
}

W.onload = function() {
	stage = D.getElementById('Stage')
	objects = {
		earth: D.getElementById('Earth'),
		soyuz: D.getElementById('Soyuz'),
		cosmonaut: D.getElementById('Cosmonaut'),
		soyuzInside: D.getElementById('SoyuzInside'),
		cosmonaut1Floating: D.getElementById('Cosmonaut1Floating'),
		cosmonaut2Floating: D.getElementById('Cosmonaut2Floating'),
		porthole: D.getElementById('Porthole'),
		library: D.getElementById('Library'),
		infirmary: D.getElementById('Infirmary'),
		construction: D.getElementById('Construction'),
		professor: D.getElementById('Professor'),
		boris: D.getElementById('Boris'),
		nurse: D.getElementById('Nurse'),
		technician: D.getElementById('Technician'),
		panel: D.getElementById('Panel'),
	}
	hotspots = {
		soyuzBody: D.getElementById('SoyuzBody'),
		porthole: D.getElementById('PortholeInside'),
		hatch: D.getElementById('Hatch'),
		radio: D.getElementById('Radio'),
		controls: D.getElementById('Controls'),
		storage1: D.getElementById('Storage1'),
		storage2: D.getElementById('Storage2'),
		innerHatch: D.getElementById('InnerHatch'),
		jevgeni: D.getElementById('Jevgeni'),
		stopLooking: D.getElementById('StopLooking'),
		plus: D.getElementById('Plus'),
		minus: D.getElementById('Minus'),
		value: D.getElementById('Value'),
		start: D.getElementById('Start'),
		reset: D.getElementById('Reset'),
		goToInfirmaryLeft: D.getElementById('GoToInfirmaryLeft'),
		goToInfirmaryRight: D.getElementById('GoToInfirmaryRight'),
		goToConstruction: D.getElementById('GoToConstruction'),
		goToLibrary: D.getElementById('GoToLibrary'),
	}
	message = D.getElementById('Message')

	for (let name in scenes) {
		const scene = scenes[name]
		scene.draw = scene.draw || function() {}
	}
	currentScene = scenes[state.scene]

	W.onresize = resize
	resize()

	if ('ontouchstart' in D) {
		D.ontouchstart = pointerInspect
		D.ontouchmove = pointerInspect
		D.ontouchend = pointerInteract
		D.ontouchleave = pointerCancel
		D.ontouchcancel = pointerCancel

		// prevent pinch/zoom on iOS 11
		D.addEventListener('gesturestart', function(event) {
			event.preventDefault()
		}, false)
		D.addEventListener('gesturechange', function(event) {
			event.preventDefault()
		}, false)
		D.addEventListener('gestureend', function(event) {
			event.preventDefault()
		}, false)
	} else {
		D.onmousedown = pointerInspect
		D.onmousemove = pointerInspect
		D.onmouseup = pointerInteract
		D.onmouseout = pointerCancel
	}
}
