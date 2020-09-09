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
					'A secret soviet space mission…',
					'…in the seventies…',
					'…and there should be more text! And this is a very very very long text that should take up more than one line which is probably very much ugly :t',
				]
				this.nextMessage = 0
				this.duration = readingTime * this.messages.length
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
				show(this, [objects.soyuzInside, objects.cosmonautFloating])
				interactive = true
			},
			draw: function(now) {
				const y = centerY - 60 + M.sin(now * .002) * 2
				objects.cosmonautFloating.style.transform =
					`translate(${centerX}px, ${y}px) scale(1.25)`
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
	message,
	currentScene,
	interactive = false

function show(scene, list) {
	for (let key in objects) {
		objects[key].style.visibility = 'hidden'
	}
	list.forEach((o) => o.style.visibility = 'visible')
	scene.draw(Date.now())
	clear()
}

function setupScene(scene) {
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

	objects.earth.style.transform = scale(4)
	objects.soyuz.style.transformOrigin = '50px 50px'
	objects.soyuzInside.style.transform = scale(3)

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
	const element = findElementByPosition(event)
	if (interactive && element != null) {
		say(element.tagName)
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
		cosmonautFloating: D.getElementById('CosmonautFloating'),
	}
	message = D.getElementById('Message')
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
