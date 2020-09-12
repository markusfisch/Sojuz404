'use strict'

const D = document,
	W = window,
	M = Math,
	lerp = (a, b, t) => (1 - t) * a + t * b,
	lerpd = (a, b, t, d) => lerp(a, b, M.min(1, t / d)),
	setBackground = (color) => D.documentElement.style.background = color,
	fadeOut = ['#0002', '#0004', '#0008', '#000a', '#000'],
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
						], () => setDialog(convs.jevgeni.course))
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
					text: () => state.madeEva
						? null
						: 'Do you see anything out there?',
					action: () => setTicker([
						`${labels.jevgeni} No, nothing at all, it's all black… how's that possible?`,
					]),
				},
				{
					text: () => state.errorSeen
						? null
						: `How can we can back?`,
					action: () => setTicker([
						`${labels.jevgeni} I suppose we have to fix the drive somehow.`,
					]),
				},
				{
					text: () => state.errorSeen
						? 'What does "err" mean?'
						: null,
					action: () => setTicker([
						`${labels.jevgeni} Hm, "err" means  error, of course.`,
					]),
				},
				{
					text: () => state.errorSeen
						? 'How do we fix the drive?'
						: null,
					action: () => setTicker([
						`${labels.jevgeni} I don't know how - didn't you talk to the scientists?`,
					], () => setDialog(convs.jevgeni.remember)),
				},
			],
			remember: [
				{
					text: () => `Yes, but I don't remember it so well. Do you?`,
					action: () => setTicker([
						`${labels.jevgeni} No, I didn't talk to them at all. Do you really remember nothing?`,
					], () => setDialog(convs.jevgeni.remember2)),
				},
				{
					text: () => state.panicked
						? `I don't care! Just bring us home!`
						: `I don't know!`,
					action: () => {
						state.panicked = true
						setTicker([
							`${labels.jevgeni} Calm down, we need to keep calm or we're lost.`,
						])
					},
				},
			],
			remember2: [
				{
					text: () => `Don't put me under pressure!`,
					action: () => setTicker([
						`${labels.jevgeni} Look, we've got to solve this somehow. You better start remembering. Is there anything I can do to help you remember?`,
					], () => setDialog(convs.jevgeni.drugs)),
				},
				{
					text: () => `I remember there was a formula on a blackboard…`,
					action: () => setTicker([
						`${labels.jevgeni} Keep thinking!`,
					]),
				},
			],
			drugs: [
				{
					text: () => `Well, do we have any drugs?`,
					action: () => setTicker([
						`${labels.jevgeni} Look in the storage! That's all we have!`,
					]),
				},
				{
					text: () => `Maybe I just need to sleep?`,
					action: () => setTicker([
						`${labels.jevgeni} If it helps…`,
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
					`You're a cosmonaut,…`,
					`…on board a secret mission…`,
					`…to test a new super-secret space drive.`,
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
				showInventory = true
				setHotspot(
					hotspots.window,
					'Look outside',
					() => setupScene('portholeEarth')
				)
				hotspots.window.style = `fill: ${state.nowhere
					? '#111'
					: '#0a8cc8'}; stroke-width: 2px; stroke: #cacbcf;`
				setHotspot(
					objects.meFloating,
					'This is me',
					() => {}
				)
				setHotspot(
					objects.jevgeniFloating,
					'Talk to Jevgeni',
					() => setDialog(state.nowhere
						? convs.jevgeni.nowhere
						: convs.jevgeni.before
					)
				)
				setHotspot(
					hotspots.hatch,
					'Go for a space walk',
					() => state.nowhere
						? setupScene('eva')
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
							`${labels.you} Moscow, we have a problem.`,
						])
						: setDialog(convs.groundControl.before)
				)
				setHotspot(
					hotspots.controls,
					'Use the controls',
					() => setupScene('panel')
				)
				setHotspot(
					hotspots.storage1,
					'Look into storage space one',
					() => {
						let message = 'A couple of space suits. Might come in handy.'
						if (state.nowhere) {
							message = `There's nothing I can use right now.`
							if (!state.storage1) {
								state.storage1 = true
								addToInventory('helmet')
								message = `You've got a helmet!`
							}
						}
						setTicker([message])
					}
				)
				setHotspot(
					hotspots.storage2,
					'Look into storage space two',
					() => {
						let message = 'Food, adhesive tape and a towel. You should always have a towel.'
						if (state.nowhere) {
							message = `There's nothing I can use right now.`
							if (!state.storage2) {
								state.storage2 = true
								addToInventory('tape')
								addToInventory('food')
								message = `You found a tape and food.`
							}
						}
						setTicker([message])
					}
				)
				setHotspot(
					hotspots.innerHatch,
					'Inner hatch',
					() => setTicker([state.nowhere
						? `Doesn't help now.`
						: `${labels.jevgeni} Don't lock me up!`
					])
				)
				show(this, [
					objects.soyuzInside,
					objects.meFloating,
					objects.jevgeniFloating,
				])
			},
			draw: function(now) {
				const f = M.sin(now * .002) * 2,
					y = centerY - 60
				objects.meFloating.style.transform =
					`translate(${centerX}px, ${y + f}px) scale(1.25)`
				objects.jevgeniFloating.style.transform =
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
				} else if (!state.whereIsEarth) {
					state.whereIsEarth = true
					setTicker([`${labels.jevgeni} Where's the earth? And where are the stars?`])
				}
				show(this, o)
			},
		},
		nowhere: {
			setup: function() {
				setBackground('#111')
				state.nowhere = true
				setTicker([
					`${labels.you} What happened?`,
				], () => setupScene('insideSoyuz'))
				show(this, [objects.soyuz])
			},
			draw: function(now) {
				const s = M.sin(now * .002),
					cy = centerY - 30 + s,
					sy = centerY - 50 - s
				objects.soyuz.style.transform =
					`translate(${centerX - 50}px, ${sy}px) rotateZ(12deg)`
			},
		},
		eva: {
			setup: function() {
				setBackground('#111')
				state.madeEva = true
				setHotspot(
					hotspots.soyuzBody,
					'Get back inside',
					() => setupScene('insideSoyuz')
				)
				hotspots.flap.style.visibility = state.knowFlap
					? 'visible'
					: 'hidden'
				if (state.knowFlap) {
					setHotspot(
						hotspots.flap,
						'Open flap',
						() => setupScene('service')
					)
				}
				if (!state.evaBefore) {
					state.evaBefore = true
					setTicker([
						`${labels.you} Where are the stars?`,
						`${labels.you} Where is everything?`,
						`${labels.you} WHERE ARE WE?`,
					])
				}
				show(this, [objects.soyuz, objects.cosmonaut])
			},
			draw: function(now) {
				const s = M.sin(now * .002),
					cy = centerY - 30 + s,
					sy = centerY - 50 - s
				objects.soyuz.style.transform =
					`translate(${centerX - 50}px, ${sy}px) scale(2) rotateZ(55deg)`
				objects.cosmonaut.style.transform =
					`translate(${centerX + 20}px, ${cy}px)`
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
				state.value = state.value || 399
				const err = state.nowhere && !state.repaired
				hotspots.value.innerHTML = err ? 'err' : state.value
				if (err) {
					state.errorSeen = true
				}
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
						if (!err) {
							hotspots.value.innerHTML = ++state.value
						}
					})
				setHotspot(
					hotspots.minus,
					'Decrease',
					() => {
						if (!err) {
							state.value = M.max(0, state.value - 1)
							hotspots.value.innerHTML = state.value
						}
					})
				setHotspot(
					hotspots.start,
					'Start the drive',
					() => {
						if (state.nowhere) {
							setTicker([
								`${labels.you} It doesn't work!`,
								`${labels.jevgeni} We should find out how to fix it.`,
							], () => setupScene('insideSoyuz'))
						} else if (state.value != 404) {
							setTicker([
								`${labels.jevgeni} This doesn't look right…`,
							])
						} else {
							flashToScene('nowhere', [
								'#d7c23a',
								'#ff0900',
								'#518e3d',
								'#fff',
								'#d7c23a',
								'#fff',
							])
						}
					}
				)
				show(this, [objects.panel])
			},
		},
		service: {
			setup: function() {
				setBackground('#e0e1e6')
				show(this, [objects.service])
			}
		},
		home: {
			setup: function() {
				setBackground('#111')
				objects.soyuz.style.transform =
					`translate(${centerX}px, ${centerY}px) rotateZ(45deg)`
				show(this, [objects.earth, objects.soyuz])
				setTicker([
					`${labels.jevgeni} We're home!`,
					`${labels.you} Yes!!`,
				], () => flashToScene('end', fadeOut))
			}
		},
		end: {
			setup: function() {
				setBackground('#111')
				info.style.bottom = '0'
				info.style.background = '#111'
				showInfo('The End')
			}
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
	info,
	dialog,
	fx,
	currentScene,
	elementUnderPointer,
	inDialog,
	showInventory,
	useItemWith,
	state = {
		inventory: [],
		scene: 'opening',
	}

function flashToScene(name, colors, index) {
	index = index || 0
	fx.style.background = colors[index]
	fx.style.display = 'block'
	setTimeout(function() {
		++index
		if (index >= colors.length) {
			fx.style.display = 'none'
			setupScene(name)
		} else {
			flashToScene(name, colors, index)
		}
	}, 100)
}

function hideInventory() {
	state.inventory.forEach((name) => {
		objects[name].style.visibility = 'hidden'
	})
}

function clearInventory() {
	hideInventory()
	state.inventory = []
}

function updateInventory() {
	let x = 10,
		y = stageHeight - 40
	state.inventory.forEach((name) => {
		objects[name].style.transform = `translate(${x}px, ${y}px) scale(.33)`
		objects[name].style.visibility = 'visible'
		x += 40
	})
}

function showUseItemWithMessage() {
	showInfo(`Use ${useItemWith} with ?`)
}

function addToInventory(name) {
	const children = objects[name].children
	for (let i = children.length; i--;) {
		const child = children[i]
		child.name = name
		child.message = `Use ${name}`
		child.action = () => {
			useItemWith = name
			showUseItemWithMessage()
		}
	}
	state.inventory.push(name)
	updateInventory()
}

function removeFromInventory(name) {
	state.inventory = state.inventory.filter((item) => item != name)
}

function combineItems(items) {
	let newItem
	items.sort()
	const a = items[0],
		b = items[1]
	if (a == 'Me' && b == 'food') {
		hideInventory()
		removeFromInventory(b)
		updateInventory()
		setTicker([`${labels.you} I'm not hungry anymore.`])
		return
	} else if (a == 'Me' && b == 'nurse') {
		flashToScene('library', fadeOut)
		return
	} else if (a == 'helmet' && b == 'tape') {
		newItem = 'nurse'
	} else {
		setTicker([`This won't work.`])
		return
	}
	hideInventory()
	removeFromInventory(a)
	removeFromInventory(b)
	addToInventory(newItem)
	updateInventory()
}

function setHotspot(hotspot, message, action) {
	const name = hotspot.id,
		children = hotspot.children
	for (let i = children.length; i--;) {
		const child = children[i]
		child.name = name
		child.message = message
		child.action = action
	}
	hotspot.message = message
	hotspot.action = action
}

function show(scene, list) {
	for (let key in objects) {
		objects[key].style.visibility = 'hidden'
	}
	list.forEach((o) => o.style.visibility = 'visible')
	scene.draw(Date.now())
}

function setDialog(conversation) {
	clear()
	inDialog = true
	dialog.innerText = ''
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
	dialog.appendChild(ul)
	dialog.style.display = 'block'
}

function clear() {
	info.style.display = 'none'
	dialog.style.display = 'none'
}

function showInfo(html) {
	info.innerHTML = html
	info.style.display = 'block'
}

function showDialog(html) {
	clear()
	dialog.innerHTML = html
	dialog.style.display = 'block'
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
	showDialog(m.text)
	inDialog = true
	return ticker.messages.reduce((total, m) => total + m.duration, 0)
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
	showDialog(m.text)
}

function tick(now) {
	if (ticker.messages && now > ticker.nextTick) {
		tickNext(now)
	}
}

function setupScene(name) {
	for (let key in hotspots) {
		hotspots[key].message = null
	}
	useItemWith = null
	showInventory = false
	resetTicker()
	state.scene = name
	currentScene = scenes[name]
	currentScene.setup()
	if (showInventory) {
		updateInventory()
	} else {
		hideInventory()
	}
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

	setupScene(state.scene)
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
			const message = elementUnderPointer.message,
				name = elementUnderPointer.name || elementUnderPointer.id
			showInfo(useItemWith
				? `Use ${useItemWith} with ${name}`
				: message)
		} else if (useItemWith) {
			showUseItemWithMessage()
		} else {
			clear()
		}
	}
	event.stopPropagation()
}

function pointerInteract(event) {
	if (!inDialog) {
		if (elementUnderPointer && elementUnderPointer.action) {
			if (useItemWith) {
				combineItems([
					useItemWith,
					elementUnderPointer.name || elementUnderPointer.id
				])
				useItemWith = null
			} else {
				elementUnderPointer.action()
			}
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
		meFloating: D.getElementById('Me'),
		jevgeniFloating: D.getElementById('Jevgeni'),
		tape: D.getElementById('Tape'),
		food: D.getElementById('Food'),
		helmet: D.getElementById('Helmet'),
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
		flap: D.getElementById('Flap'),
		window: D.getElementById('Window'),
		hatch: D.getElementById('Hatch'),
		radio: D.getElementById('Radio'),
		controls: D.getElementById('Controls'),
		storage1: D.getElementById('Storage1'),
		storage2: D.getElementById('Storage2'),
		innerHatch: D.getElementById('InnerHatch'),
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
	info = D.getElementById('Info')
	dialog = D.getElementById('Dialog')
	fx = D.getElementById('FX')

	for (let name in scenes) {
		const scene = scenes[name]
		scene.draw = scene.draw || function() {}
	}

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
