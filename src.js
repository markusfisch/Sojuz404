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
				earth.style.visibility = 'visible'
				soyuz.style.visibility = 'visible'
				soyuzInside.style.visibility = 'hidden'
				cosmonautFloating.style.visibility = 'hidden'
				this.startX = centerX - 75
				this.startY = centerY - 75
				this.stopX = centerX - 25
				this.stopY = centerY - 25
				this.begin = Date.now()
				this.duration = 3000
			},
			draw: function() {
				const now = Date.now(),
					t = M.min(1, (now - this.begin) / this.duration),
					x = lerp(this.startX, this.stopX, t),
					y = lerp(this.startY, this.stopY, t)
				soyuz.style.transform = `translate(${x}px, ${y}px) rotateZ(45deg)`
				if (now - this.begin > this.duration) {
					scene = scenes.soyuz
					scene.setup()
				}
			}
		},
		soyuz: {
			setup: function() {
				D.documentElement.style.background = '#3d4532'
				earth.style.visibility = 'hidden'
				soyuz.style.visibility = 'hidden'
				soyuzInside.style.visibility = 'visible'
				cosmonautFloating.style.visibility = 'visible'
			},
			draw: function() {
				const t = Date.now() * .002
				cosmonautFloating.style.transform = `translate(${centerX}px, ${centerY - 60 + M.sin(t) * 2}px) scale(1.25)`
			}
		},
	}

function lerp(a, b, t) {
	return (1 - t) * a + t * b
}

function run() {
	animationRequestId = requestAnimationFrame(run)
	scene.draw()
}

function scaleCenter(scale, pivotX, pivotY) {
	const f = 100 * scale * .5,
		x = pivotX || centerX - f,
		y = pivotY || centerY - f
	return `translate(${x}px, ${y}px) scale(${scale})`
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
	earth.style.transform = scaleCenter(5)
	soyuz.style.transformOrigin = '50px 50px'
	soyuzInside.style.transform = scaleCenter(3)
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
