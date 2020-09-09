'use strict'

const D = document,
	W = window,
	M = Math,
	lerp = (a, b, t) => (1 - t) * a + t * b,
	lerpd = (a, b, t, d) => lerp(a, b, M.min(1, t / d)),
	setBackground = (color) => D.documentElement.style.background = color,
	readingTime = 3000,
	scenes = {
		opening: {
			setup: function() {
				setBackground('#111')
				show(this, [objects.earth, objects.soyuz])
				this.startX = centerX - 75
				this.startY = centerY - 75
				this.stopX = centerX - 25
				this.stopY = centerY - 25
				this.begin = Date.now()
				this.messages = [
					'A secret mission…',
				]
				this.nextMessage = 0
				this.duration = readingTime * this.messages.length
				interactive = false
			},
			draw: function(now) {
				const t = now - this.begin,
					d = this.duration,
					x = lerpd(this.startX, this.stopX, t, d),
					y = lerpd(this.startY, this.stopY, t, d)
				objects.soyuz.style.transform =
					`translate(${x}px, ${y}px) rotateZ(45deg)`
				if (t > this.nextMessage) {
					this.nextMessage = t + readingTime
					say(this.messages[t / readingTime | 0])
				}
				if (t > this.duration) {
					setupScene(scenes.soyuz)
				}
			}
		},
		soyuz: {
			setup: function() {
				setBackground('#3d4532')
				const porthole = hotspots.porthole
				porthole.message = 'Look outside'
				porthole.onclick = function() {
					setupScene(scenes.portholeEarth)
				}
				hotspots.jevgeni.message = 'Talk to Jevgeni'
				const hatch = hotspots.hatch
				hatch.message = 'Go for a Spacewalk'
				hatch.onclick = function() {
// DEBUG
setupScene(scenes.nirvana)
				}
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
			}
		},
		portholeEarth: {
			setup: function() {
				setBackground('#e0e1e6')
				const inside = hotspots.inside
				inside.message = 'Stop looking outside the window'
				inside.onclick = function() {
					setupScene(scenes.soyuz)
				}
				show(this, [objects.earth, objects.porthole])
			},
		},
		nirvana: {
			setup: function() {
				setBackground('#111')
				show(this, [objects.soyuz, objects.cosmonaut])
				const backInside = hotspots.backInside
				backInside.message = 'Get back inside'
				backInside.onclick = function() {
					setupScene(scenes.soyuz)
				}
			},
			draw: function(now) {
				const s = M.sin(now * .002),
					cy = centerY - 30 + s,
					sy = centerY - 50 - s
				objects.soyuz.style.transform =
					`translate(${centerX - 50}px, ${sy}px) rotateZ(12deg)`
				objects.cosmonaut.style.transform =
					`translate(${centerX + 20}px, ${cy}px) scale(.2)`
			}
		},
		library: {
			setup: function() {
				setBackground('#2b1f89')
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
				const y = centerY - 20
				objects.technician.style.transform =
					`translate(${centerX - 50}px, ${y}px)`
				objects.boris.style.transform =
					`translate(${centerX - 135}px, ${y - 5}px)`
				show(this, [
					objects.construction,
					objects.technician,
					objects.boris,
				])
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
	interactive

function show(scene, list) {
	for (let key in objects) {
		objects[key].style.visibility = 'hidden'
	}
	list.forEach((o) => o.style.visibility = 'visible')
	scene.draw(Date.now())
	clear()
}

function setupScene(scene) {
	for (let key in hotspots) {
		hotspots[key].message = null
	}
	interactive = true
	currentScene = scene
	currentScene.setup()
}

function clear() {
	message.style.display = 'none'
}

function say(text) {
	message.innerText = text
	message.style.display = 'block'
}

function run() {
	animationRequestId = requestAnimationFrame(run)
	currentScene.draw(Date.now())
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

	const scale3 = scale(3)
	objects.earth.style.transform = scale(5)
	objects.soyuz.style.transformOrigin = '50px 50px'
	objects.soyuzInside.style.transform = scale3
	objects.porthole.style.transform = scale3
	objects.library.style.transform = scale3
	objects.infirmary.style.transform = scale3
	objects.construction.style.transform = scale3

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
	if (interactive) {
		const element = findElementByPosition(event)
		if (element && element.message) {
			say(element.message)
		} else {
			clear()
		}
	}
	event.stopPropagation()
}

function pointerInteract(event) {
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
	}
	hotspots = {
		porthole: D.getElementById('SoyuzPorthole'),
		inside: D.getElementById('GetBackInside'),
		jevgeni: D.getElementById('Jevgeni'),
		hatch: D.getElementById('Hatch'),
		backInside: D.getElementById('BackInside'),
	}
	message = D.getElementById('Message')

	for (let name in scenes) {
		const scene = scenes[name]
		scene.draw = scene.draw || function() {}
	}
	currentScene = scenes.opening

	W.onresize = resize
	resize()

	D.onmousedown = pointerInspect
	D.onmousemove = pointerInspect
	D.onmouseup = pointerInteract
	D.onmouseout = pointerCancel

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
	}
}
