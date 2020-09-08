'use strict'

const D = document,
	W = window,
	M = Math

let animationRequestId,
	centerX,
	centerY,
	stageWidth,
	stageHeight,
	stage,
	earth,
	soyuz,
	cosmonaut,
	soyuzInside,
	cosmonautFloating,
	message,
	scene,
	scenes = {
		opening: {
			setup: function() {
				D.documentElement.style.background = '#111'
				earth.style.display = 'block'
				soyuz.style.display = 'block'
				soyuzInside.style.display = 'none'
				cosmonautFloating.style.display = 'none'
				this.x = centerX - 100
				this.y = centerY - 100
				this.begin = Date.now()
			},
			draw: function() {
				const f = .5
				this.x += f
				this.y += f
				soyuz.style.transform = `translate(${this.x}px, ${this.y}px) rotateZ(45deg)`
				if (Date.now() - this.begin > 3000) {
					scene = scenes.soyuz
					scene.setup()
				}
			}
		},
		soyuz: {
			setup: function() {
				D.documentElement.style.background = '#3d4532'
				earth.style.display = 'none'
				soyuz.style.display = 'none'
				soyuzInside.style.display = 'block'
				cosmonautFloating.style.display = 'block'
			},
			draw: function() {
				const t = Date.now() * .002
				cosmonautFloating.style.transform = `translate(${centerX}px, ${centerY - 60 + M.sin(t) * 2}px) scale(1.25)`
			}
		},
	}

function run() {
	animationRequestId = requestAnimationFrame(run)
	scene.draw()
}

function resize() {
	if (animationRequestId) {
		cancelAnimationFrame(animationRequestId)
	}
	const windowWidth = window.innerWidth,
		windowHeight = window.innerHeight,
		min = M.min(windowWidth, windowHeight),
		scale = min / 300,
		style = stage.style
	stageWidth = windowWidth / scale
	stageHeight = windowHeight / scale
	style.width = stageWidth + 'px'
	style.height = stageHeight + 'px'
	style.transformOrigin = 'top left'
	style.transform = `scale(${scale})`
	style.display = 'block'
	centerX = stageWidth * .5
	centerY = stageHeight * .5
	earth.style.transform = `translate(${centerX - 250}px, ${centerY - 250}px) scale(5)`
	soyuz.style.transformOrigin = '50px 50px'
	cosmonaut.style.transform = `scale(.5)`
	soyuzInside.style.transform = `translate(${centerX - 150}px, ${centerY - 150}px) scale(3)`
	scene.setup()
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
	if (element != null) {
		message.innerText = element.tagName
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
	earth = D.getElementById('Earth')
	soyuz = D.getElementById('Soyuz')
	cosmonaut = D.getElementById('Cosmonaut')
	soyuzInside = D.getElementById('SoyuzInside')
	cosmonautFloating = D.getElementById('CosmonautFloating')
	message = D.getElementById('Message')
	scene = scenes.opening

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
