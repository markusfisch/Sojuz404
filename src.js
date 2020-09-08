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
	scene,
	background,
	soyus,
	cosmonaut,
	message

function draw() {
	const t = Date.now() * .001,
		x = centerX - 50,
		y = centerY + M.sin(t) * 4 - 50
	soyus.style.transformOrigin = '50px 50px'
	soyus.style.transform = `translate(${x}px, ${y}px) rotateZ(22deg)`
	cosmonaut.style.transformOrigin = '50px 50px'
	cosmonaut.style.transform = `translate(${x - 70}px, ${y + 50}px) scale(.5)`
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
	background.style.transform = `translate(${centerX - 25}px, ${centerY - 30}px) scale(1.5)`
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
	scene = D.getElementById('Scene')
	background = D.getElementById('Background')
	soyus = D.getElementById('Soyus')
	cosmonaut = D.getElementById('Cosmonaut')
	message = D.getElementById('Message')

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
