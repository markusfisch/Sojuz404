'use strict'

const W = window,
	M = Math

let animationRequestId,
	centerX,
	centerY,
	stageWidth,
	stageHeight,
	stage,
	scene,
	background,
	soyus

function draw() {
	const t = Date.now() * .001,
		x = centerX - 50,
		y = centerY + M.sin(t) * 4 - 50
	soyus.style.transformOrigin = '50px 50px'
	soyus.style.transform = `translate(${x}px, ${y}px) rotateZ(22deg)`
}

function run() {
	animationRequestId = requestAnimationFrame(run)
	draw()
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
	background.style.transform = `translate(${centerX}px, ${centerY}px)`
	run()
}

function pointerInspect(event) {
	event.stopPropagation()
}

function pointerInteract(event) {
	event.stopPropagation()
}

function pointerCancel(event) {
	event.stopPropagation()
}

W.onload = function() {
	const D = document

	stage = D.getElementById('Stage')
	scene = D.getElementById('Scene')
	background = D.getElementById('Background')
	soyus = D.getElementById('Soyus')

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
