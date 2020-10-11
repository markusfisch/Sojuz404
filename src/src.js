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
		yevgeni: '<span class="Yevgeni">Yevgeni:</span>',
		groundControl: '<span class="GroundControl">Ground Control:</span>',
		professor: '<span class="Professor">Professor:</span>',
		nurse: '<span class="Nurse">Olga:</span>',
		technician: '<span class="Technician">Vitali:</span>',
	},
	convs = {
		yevgeni: {
			before: [
				{
					text: () => state.everythingOkay
						? null
						: 'Everything okay back there?',
					action: () => {
						state.everythingOkay = true
						setTicker([
							`${labels.yevgeni} It's a bit tight, but at least I have a window.`,
						])
					},
				},
				{
					text: () => 'Would you please stop farting?',
					action: () => setTicker([
						`${labels.yevgeni} This was the last one. Promise.`
					]),
				},
			],
			nowhere: [
				{
					text: () => state.madeEva
						? null
						: state.seeAnything
							? 'Still nothing to see?'
							: 'Do you see anything out there?',
					action: () => {
						setTicker([
							`${labels.yevgeni} No, ${state.seeAnything
								? `still nothing.`
								: `nothing at all, it's all black… how's that possible?`}`,
						])
						state.seeAnything = true
					},
				},
				{
					text: () => state.errorSeen
						? null
						: `How can we get can back?`,
					action: () => setTicker([
						`${labels.yevgeni} Let's use the drive!`
					]),
				},
				{
					text: () => state.errorSeen
						? 'How do we fix the drive?'
						: null,
					action: () => {
						state.needSleep = true
						setTicker([
							`${labels.yevgeni} I don't know! Don't you remember?`,
							`${labels.you} No, not really, but if I could sleep, I could go back in my dreams! I'm a lucid dreamer. I just need something to fall asleep.`,
						])
					}
				},
				{
					text: () => state.needSleep
						? `Do we have any drugs?`
						: null,
					action: () => setTicker([
						`${labels.yevgeni} Look in the storage! That's all we have!`,
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
							`${labels.groundControl} Input 404 into the control panel and start the drive.`,
						])
					}
				},
			],
		},
		professor: {
			opening: [
				{
					text: () => `How can I fix the space drive?`,
					action: () => setTicker([
						`${labels.professor} How would I know? I didn't build the damn thing. I just designed it.`,
					]),
				},
				{
					text: () => `What's this formula, square root of x²+y²+z²-c²t²?`,
					action: () => {
						state.noticedFormula = true
						setTicker([
							`${labels.professor} It's used to calclulate a spacetime interval. The distance between one point in spacetime and another. This is an essential calculation for the drive to work correctly!`,
						], () => setDialog(convs.professor.detail))
					}
				},
			],
			detail: [
				{
					text: () => `What do the symbols stand for?`,
					action: () => setTicker([
						`${labels.professor} x, y and z are the coordinates of space. c is the speed of light. And t is the time.`,
					])
				},
				{
					text: () => `What would happen if the formula was wrong?`,
					action: () => setTicker([
						`${labels.professor} Depends. You would definitely not end up where you should be.`,
					])
				},
				{
					text: () => state.itsPlus
						? `Is it really MINUS c²t²?`
						: null,
					action: () => setTicker([
						`${labels.professor} Sure! That's because the time coordinate is an imaginary number.`,
					])
				},
			],
		},
		nurse: {
			opening: [
				{
					text: () => `How do I wake up?`,
					action: () => setTicker([
						`${labels.nurse} Just wake up.`,
					], () => setupScene('insideSoyuz')),
				},
				{
					text: () => `Nevermind`,
					action: resetTicker,
				},
			],
		},
		technician: {
			opening: [
				{
					text: () => state.noticedFormula
						? `Do you know the formula square root of x²+y²+z²-c²t²?`
						: null,
					action: () => {
						state.itsPlus = true
						setTicker([
							`${labels.technician} Of course, but it's x²+y²+z² PLUS c²t²!`,
							`${labels.you} Why plus?`,
							`${labels.technician} It's cleary plus because c² is a very big number and that would mean drawing a root from a negative number.`,
							`${labels.you} Hm.`,
						])
					}
				},
				{
					text: () => `How do I access the drive?`,
					action: () => {
						state.knowFlap = true
						setTicker([
							`${labels.technician} Only from the outside. You can get access to it behind that gray flap there.`,
						])
					}
				},
			],
		},
	},
	scenes = {
		opening: {
			setup: function() {
				setBackground('#111')
				this.bx = centerX - 75
				this.by = centerY - 75
				this.ex = centerX - 25
				this.ey = centerY - 25
				this.st = Date.now()
				this.duration = setTicker([
					`You're a Pavel, commander of Soyuz 404…`,
					`…a secret mission…`,
					`…to test a new space drive…`,
				], () => setupScene('insideSoyuz'))
				show(this, [objects.earth, objects.soyuz])
			},
			draw: function(now) {
				const t = now - this.st,
					d = this.duration,
					x = lerpd(this.bx, this.ex, t, d),
					y = lerpd(this.by, this.ey, t, d)
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
					objects.yevgeniFloating,
					'Talk to Yevgeni',
					() => setDialog(state.nowhere
						? convs.yevgeni.nowhere
						: convs.yevgeni.before
					)
				)
				setHotspot(
					hotspots.hatch,
					'Go for a space walk',
					() => state.nowhere
						? setupScene('eva')
						: setTicker([
							`${labels.yevgeni} Not yet, we have a mission, comrade!`,
						])
				)
				setHotspot(
					hotspots.radio,
					'Talk to ground control',
					() => state.nowhere
						? setTicker([
							`zzz…`,
							`${labels.yevgeni} No contact… I guess we've got to help ourselves!`,
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
					hotspots.s1,
					'Look into storage 1',
					() => {
						let message = `A couple of space suits. Might come in handy.`
						if (state.nowhere) {
							message = `There's nothing I can use right now.`
							if (!state.s1) {
								state.s1 = true
								addToInventory('helmet')
								message = `You've got a helmet!`
							}
						}
						setTicker([message])
					}
				)
				setHotspot(
					hotspots.s2,
					'Look into storage 2',
					() => {
						let message = `Food, adhesive tape and a towel. It's always good to have a towel.`
						if (state.nowhere) {
							message = `There's nothing I can use right now.`
							if (!state.s2) {
								state.s2 = 1
								addToInventory('tape')
								addToInventory('food')
								message = `You found a tape and food.`
							} else if (state.s2 == 1) {
								state.s2 = 2
								addToInventory('pills')
								message = `You find sleeping pills!`
							}
						}
						setTicker([message])
					}
				)
				show(this, [
					objects.soyuzInside,
					objects.meFloating,
					objects.yevgeniFloating,
				])
			},
			draw: function(now) {
				const f = M.sin(now * .002) * 2,
					y = centerY - 60
				objects.meFloating.style.transform =
					`translate(${centerX}px, ${y + f}px) scale(1.25)`
				objects.yevgeniFloating.style.transform =
					`translate(${centerX - 162}px, ${y - f}px) scale(1.25)`
			},
		},
		portholeEarth: {
			setup: function() {
				setBackground('#111')
				setHotspot(
					hotspots.stopLooking,
					'Stop looking',
					() => setupScene('insideSoyuz')
				)
				const o = [objects.porthole]
				if (!state.nowhere) {
					o.unshift(objects.earth)
					if (!state.aboveAfrica) {
						state.aboveAfrica = true
						setTicker([`${labels.yevgeni} Africa!`])
					}
				} else if (!state.whereIsEarth) {
					state.whereIsEarth = true
					setTicker([`${labels.yevgeni} Where's the earth? And where are the stars?`])
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
					objects.soyuz,
					'Get back inside',
					() => setupScene('insideSoyuz')
				)
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
		service: {
			setup: function() {
				setBackground('#e0e1e6')
				updateOperations()
				setHotspot(
					hotspots.shutFlap,
					'Back',
					() => setupScene('eva')
				)
				for (let i = 1; i < 10; ++i) {
					setHotspot(
						hotspots[`o${i}`],
						`Operation #${i}`,
						() => {
							++state.operations[i - 1]
							updateOperations()
						}
					)
				}
				setTicker([`${labels.you} Let's make that last + a -`])
				show(this, [objects.service])
			}
		},
		library: {
			setup: function() {
				setBackground('#2b1f89')
				setHotspot(
					objects.professor,
					'Talk to the professor',
					() => setDialog(state.noticedFormula
						? convs.professor.detail
						: convs.professor.opening
					)
				)
				setHotspot(
					hotspots.computer,
					'Computer',
					() => setTicker([
						`${labels.you} Looks like it's just a prop for this dream scene.`,
					])
				)
				setHotspot(
					hotspots.toInfRight,
					'Go to infirmary',
					() => setupScene('infirmary')
				)
				const y = centerY - 20
				objects.professor.style.transform =
					`translate(${centerX - 20}px, ${y}px)`
				objects.pavel.style.transform =
					`translate(${centerX - 140}px, ${y}px)`
				show(this, [
					objects.library,
					objects.professor,
					objects.pavel,
				])
			},
		},
		infirmary: {
			setup: function() {
				setBackground('#2b1f89')
				setHotspot(
					objects.nurse,
					'Talk to the nurse',
					() => setDialog(convs.nurse.opening)
				)
				setHotspot(
					hotspots.toLib,
					'Go to library',
					() => setupScene('library')
				)
				setHotspot(
					hotspots.toCon,
					'Go to construction',
					() => setupScene('construction')
				)
				const y = centerY - 20
				objects.nurse.style.transform =
					`translate(${centerX - 125}px, ${y}px)`
				objects.pavel.style.transform =
					`translate(${centerX + 30}px, ${y - 5}px) scaleX(-1)`
				show(this, [
					objects.infirmary,
					objects.nurse,
					objects.pavel,
				])
			},
		},
		construction: {
			setup: function() {
				setBackground('#2b1f89')
				setHotspot(
					objects.technician,
					'Talk to the technician',
					() => setDialog(convs.technician.opening)
				)
				setHotspot(
					hotspots.conFlap,
					'Flap',
					() => {
						setTicker([state.knowFlap
							? `${labels.you} Behind that flap is the drive!`
							: `${labels.you} I wonder what is behind this flap.`,
						])
					}
				)
				setHotspot(
					hotspots.toInfLeft,
					'Go to infirmary',
					() => setupScene('infirmary')
				)
				const y = centerY - 25
				objects.technician.style.transform =
					`translate(${centerX - 60}px, ${y}px)`
				objects.pavel.style.transform =
					`translate(${centerX + 25}px, ${y - 5}px) scaleX(-1)`
				show(this, [
					objects.construction,
					objects.technician,
					objects.pavel,
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
					'Plus',
					() => {
						if (!err) {
							hotspots.value.innerHTML = ++state.value
						}
					})
				setHotspot(
					hotspots.minus,
					'Minus',
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
						const colors = [
							'#d7c23a',
							'#ff0900',
							'#518e3d',
							'#fff',
							'#d7c23a',
							'#fff',
						]
						if (state.nowhere) {
							if (state.value == 200 && state.repaired) {
								flashTo('home', colors)
							} else {
								setTicker([
									`${labels.you} It doesn't work!`,
									`${labels.yevgeni} We should find out how to fix it.`,
								], () => setupScene('insideSoyuz'))
							}
						} else {
							if (state.value == 404) {
								flashTo('nowhere', colors)
							} else {
								setTicker([
									`${labels.yevgeni} This doesn't look right…`,
								])
							}
						}
					}
				)
				show(this, [objects.panel])
			},
		},
		home: {
			setup: function() {
				setBackground('#111')
				this.bx = centerX - 75
				this.by = centerY - 75
				this.ex = centerX - 25
				this.ey = centerY - 25
				this.st = Date.now()
				this.duration = setTicker([
					`${labels.yevgeni} We're home!`,
					`${labels.you} Yes!`,
				], () => flashTo('end', fadeOut))
				show(this, [objects.earth, objects.soyuz])
			},
			draw: function(now) {
				const t = now - this.st,
					d = this.duration,
					x = lerpd(this.bx, this.ex, t, d),
					y = lerpd(this.by, this.ey, t, d)
				objects.soyuz.style.transform =
					`translate(${x}px, ${y}px) rotateZ(45deg)`
			},
		},
		end: {
			setup: function() {
				setBackground('#111')
				info.style.background = '#111'
				info.style.bottom = '0'
				info.style.margin = 'auto'
				info.style.height = '1%'
				inDialog = true
				showInfo('The End')
				show(this, [])
			}
		},
	}

let rId,
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
	ebp,
	inDialog,
	showInventory,
	useItemWith,
	state = {
		inventory: [],
		operations: [2,2,2,2,2,0,2,0,0],
		scene: 'opening',
	}

function updateOperations() {
	const fills = [
		'#00a270',
		'#e55500',
		'#0073b7',
		'#f1e500',
	]
	const key = [2,2,2,2,2,0,2,0,1]
	let correct = true
	for (let i = 1; i < 10; ++i) {
		const j = i - 1,
			value = state.operations[j] % 4
		hotspots[`o${i}`].style = `fill: ${fills[value]}`
		if (key[j] != value) {
			correct = false
		}
	}
	if (correct) {
		state.repaired = true
		state.value = 200
		setTicker([
			`${labels.you} That looks good!`
		])
	}
}

function flashTo(name, colors, index) {
	index = index || 0
	fx.style.background = colors[index]
	fx.style.display = 'block'
	setTimeout(function() {
		++index
		if (index >= colors.length) {
			fx.style.display = 'none'
			setupScene(name)
		} else {
			flashTo(name, colors, index)
		}
	}, 100)
}

function hideInventory() {
	state.inventory.forEach((name) => {
		objects[name].style.visibility = 'hidden'
	})
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
	items.sort()
	const a = items[0],
		b = items[1]
	if ((a == 'Me' || a == 'Yevgeni') && b == 'food') {
		hideInventory()
		removeFromInventory(b)
		updateInventory()
		setTicker([`${labels[a == 'Me' ? 'you' : 'yevgeni']} Tasty!`])
	} else if (a == 'Me' && b == 'pills') {
		setTicker([
			`I'm feeling dizzy already…`,
		], () => flashTo('library', fadeOut))
	} else {
		setTicker([`Doesn't work.`])
	}
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
	const ol = D.createElement('ol')
	conversation.map(function(option) {
		const text = option.text()
		if (text) {
			const li = D.createElement('li'),
				a = D.createElement('a')
			a.onclick = option.action
			a.innerHTML = text
			li.appendChild(a)
			ol.appendChild(li)
		}
	})
	dialog.appendChild(ol)
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
	rId = requestAnimationFrame(run)
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
	if (rId) {
		cancelAnimationFrame(rId)
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
	objects.pavel.style.transformOrigin = center
	objects.panel.style.transform = scale3
	objects.service.style.transform = scale3

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
		ebp = findElementByPosition(event)
		if (ebp && ebp.message) {
			const message = ebp.message,
				name = ebp.name || ebp.id
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
		if (ebp && ebp.action) {
			if (useItemWith) {
				combineItems([
					useItemWith,
					ebp.name || ebp.id
				])
				useItemWith = null
			} else {
				ebp.action()
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
		soyuzInside: D.getElementById('Inside'),
		meFloating: D.getElementById('Me'),
		yevgeniFloating: D.getElementById('Yevgeni'),
		tape: D.getElementById('Tape'),
		food: D.getElementById('Food'),
		helmet: D.getElementById('Helmet'),
		pills: D.getElementById('Pills'),
		porthole: D.getElementById('Porthole'),
		library: D.getElementById('Library'),
		infirmary: D.getElementById('Infirmary'),
		construction: D.getElementById('Construction'),
		professor: D.getElementById('Professor'),
		pavel: D.getElementById('Pavel'),
		nurse: D.getElementById('Nurse'),
		technician: D.getElementById('Technician'),
		panel: D.getElementById('Panel'),
		service: D.getElementById('Service'),
	}
	hotspots = {
		flap: D.getElementById('Flap'),
		window: D.getElementById('Window'),
		hatch: D.getElementById('Hatch'),
		radio: D.getElementById('Radio'),
		controls: D.getElementById('Controls'),
		s1: D.getElementById('S1'),
		s2: D.getElementById('S2'),
		stopLooking: D.getElementById('Bck'),
		plus: D.getElementById('Plus'),
		minus: D.getElementById('Minus'),
		value: D.getElementById('Value'),
		start: D.getElementById('Start'),
		reset: D.getElementById('Reset'),
		toInfLeft: D.getElementById('ToInfL'),
		toInfRight: D.getElementById('ToInfR'),
		toCon: D.getElementById('ToCon'),
		toLib: D.getElementById('ToLib'),
		computer: D.getElementById('Computer'),
		conFlap: D.getElementById('ConFlap'),
		shutFlap: D.getElementById('ShutFlap'),
		o1: D.getElementById('O1'),
		o2: D.getElementById('O2'),
		o3: D.getElementById('O3'),
		o4: D.getElementById('O4'),
		o5: D.getElementById('O5'),
		o6: D.getElementById('O6'),
		o7: D.getElementById('O7'),
		o8: D.getElementById('O8'),
		o9: D.getElementById('O9'),
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
