// whenever window size changes, redraw image
window.addEventListener("resize", draw); 

var terminateAsync = false;
var mode = false;

/**
 * main drawing function
 * */
async function draw() {

	// check if canvas is visible
	if (document.getElementById("canvasDiv").style.display == "none") {
		return;
	}

	// container for variables
	var variables = {};
	variables.alpha = +document.getElementById("alphaAngleSlider").value * Math.PI / 180;
	variables.numRays = +document.getElementById("numRaysSlider").value;
	variables.n = +document.getElementById("nSlider").value * 0.01 + 1.33;
	variables.omega = 62 * Math.PI / 180;
	
	// update values visible to user
	document.getElementById("alphaValue").innerHTML = document.getElementById("alphaAngleSlider").value + "°";
	document.getElementById("numRays").innerHTML = variables.numRays;
	document.getElementById("nValue").innerHTML = Math.floor(100 * variables.n) / 100;

	// draw mode
	// if previous mode was static -> terminateAsync = false
	if (mode == false && document.getElementById("modeCheckbox").checked == true)
		terminateAsync = false;
	mode = document.getElementById("modeCheckbox").checked;

	var canvas = document.getElementById("canvas");
	if (canvas.getContext) {
		const ctx = canvas.getContext("2d");

		// preparation
		prepareDrawing(canvas, ctx, variables);
		
		if (mode) {

			// check if new draw() has been invoked
			if (terminateAsync)
				return;

			terminateAsync = true;
			await new Promise(r => setTimeout(r, 20));
			terminateAsync = false;
			dynamicDraw(canvas, ctx, variables);

		} else {

			terminateAsync = true;
			staticDraw(canvas, ctx, variables);

		}

	}

}

/**
 * function drawing Prism
 * @param canvas
 * @param context
 * @param variables
 * */
function drawPrism(canvas, ctx, v) {
	/* 
		prism 
	 	omega = 62 -> tg(omega/2) = 0.6 

		vertices: 	(x, y)
		left down 	(0.3w, 0.22h)
		right down 	(0.7w, 0.22h)
		upper		(0.5w, 0.22h + 0.33w)
	*/
	ctx.beginPath(); 
	ctx.strokeStyle = "rgb(141, 141, 141)";
	ctx.lineWidth = 5;
	// left down vertice
	ctx.moveTo(canvas.width / 2 - v.prismWidthHalf, 0.78 * canvas.height);
	ctx.lineTo(canvas.width / 2 + v.prismWidthHalf, 0.78 * canvas.height);
	// right down vertice
	ctx.moveTo(canvas.width / 2 + v.prismWidthHalf, 0.78 * canvas.height);
	ctx.lineTo(canvas.width / 2, 0.78 * canvas.height - v.prismHeight);
	// upper vertice
	ctx.moveTo(canvas.width / 2, 0.78 * canvas.height - v.prismHeight);
	ctx.lineTo(canvas.width / 2 - v.prismWidthHalf, 0.78 * canvas.height);
	ctx.stroke();
	ctx.closePath();
	
}

/**
 * draws ray of white light
 * @param canvas
 * @param context
 * @param variables
 * @param x value of end point
 * */
function drawLight(canvas, ctx, v, xEnd) {
	/* 
		white light 
		touches left wall of Prism on (0.4w, 0.22h + 0.165w)
	*/
	ctx.beginPath();
	ctx.strokeStyle = "rgb(214, 214, 214)";
	ctx.lineWidth = 3;

	var x = 0;
	var y = v.aSource * x + v.bSource;
	ctx.moveTo(x, canvas.height - y)
	ctx.lineTo(xEnd, canvas.height - xEnd * v.aSource - v.bSource);
	ctx.stroke();
	ctx.closePath();

}

/**
 * invoked before drawing
 * @param canvas
 * @param context
 * @param variables
 * */
function prepareDrawing(canvas, ctx, v) {
		// adjust canvas size to windows size
		ctx.canvas.width  = 0.6 * window.innerWidth;
		if (0.6 * canvas.width > window.innerHeight) {
			ctx.canvas.height = window.innerHeight;
		} else {
			ctx.canvas.height = 0.6 * canvas.width;
		}

		// clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// prism size
		v.prismWidthHalf = canvas.width / 5;
		v.prismHeight = v.prismWidthHalf / 0.6;
		// left wall of prism: slope, intercept
		v.aLeft = v.prismHeight / v.prismWidthHalf;
		v.bLeft = 0.22 * canvas.height - 0.5 * canvas.width;
		// right wall of prism: slope, intercept
		v.aRight = - v.prismHeight / v.prismWidthHalf;
		v.bRight = 1.1667 * canvas.width + 0.22 * canvas.height;

		// source of light: slope, intercept
		// source touches left wall on (0.4w, 0.22h + 0.165w)
		v.aSource = Math.tan(v.alpha);
		v.bSource = 0.22 * canvas.height + 0.165 * canvas.width - v.aSource * 0.4 * canvas.width;

}

/**
 * draws monochromatic ray
 * @param canvas
 * @param context
 * @param n index of refraction
 * @param color
 * @param x value of starting point
 * @param y value of statring point
 * @param variables
 * @param x value of end point
 * */
function drawDispersionRay(canvas, ctx, n, color, x, y, v, xEnd) {

	// using Snell`s law to find new path of ray
	var theta1 = v.alpha + v.omega / 2;
	var theta2 = Math.asin(Math.sin(theta1) / n);
	var a1 = Math.tan(-v.omega / 2 + theta2);
	var b1 = y - a1 * x;


	// inside prism
	// point where new ray touches right wall of prism
	var x1 = (v.bRight - b1) / (a1 - v.aRight);
	var flag = true;
	if (x1 > xEnd) {
		flag = false;
		x1 = xEnd;
	}
	var y1 = a1 * x1 + b1;



	ctx.beginPath(); 
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.moveTo(x, canvas.height - y);
	ctx.lineTo(x1, canvas.height - y1);
	ctx.stroke();
	ctx.closePath();

	// outside of prism
	if (flag) {
		theta3 = v.omega - theta2;
		var theta4 = Math.asin(n * Math.sin(theta3));
		var a3 = -Math.tan(theta4 - v.omega / 2);
		var b3 = y1 - a3 * x1;

		var x3 = xEnd;
		var y3 = a3 * x3 + b3;

		ctx.beginPath(); 
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.moveTo(x1, canvas.height - y1);
		ctx.lineTo(x3, canvas.height - y3);
		ctx.stroke();
		ctx.closePath();
	}
	
}

/**
 * static draw
 * @param canvas
 * @param context
 * @param variables
 * */
function staticDraw(canvas, ctx, v) {

	// light
	drawLight(canvas, ctx, v, canvas.width * 0.4);

	var step = (v.numRays - 1) / 4;
	var r, g, b, str, nR;
	// loop drawing rays
	for (var i = 0; i < v.numRays; i++) {
		if (i < step) {
			r = 255;
			g = Math.floor(i * 255 * 5 / v.numRays);
			b = 0;
		} else if (i < step * 2) {
			r = 255 - Math.floor((i - step) * 255 * 5 / v.numRays);
			g = 255;
			b = 0;
		} else if (i < step * 3) {
			r = 0;
			g = 255;
			b = Math.floor((i - 2 * step) * 255 * 5 / v.numRays);
		} else {
			r = Math.floor(((i - 3 * step) * 255 * 5 / v.numRays) / 2);
			g = 255 - Math.floor((i - 3 * step) * 255 * 5 / v.numRays);
			b = 255;
		}
		str = "rgb(" + r + "," + g + "," + b + ")"; 
		nR = v.n * (1 + (i - (v.numRays - 1) / 2) * 0.05 / (v.numRays - 1)); 
		drawDispersionRay(canvas, ctx, nR, str, (canvas.width - v.prismWidthHalf) / 2, 0.22 * canvas.height + v.prismHeight / 2 - 1, v, canvas.width)	
	}

	// Prism 
	drawPrism(canvas, ctx, v);

}

/**
 * dynamic draw
 * @param canvas
 * @param context
 * @param variables
 * */
async function dynamicDraw(canvas, ctx, v) {

	var xStep = canvas.width / 120;
	var xEnd = xStep;
	var xStart, yStart, yEnd;
	for (var j = 1; j <= 120; j++) {

		// check if new draw() has been invoked
		if (terminateAsync)
			return;

		xEnd += xStep;
		// white light
		if (xEnd <= canvas.width * 0.4) {
			drawLight(canvas, ctx, v, xEnd)
		} else {

			// light
			drawLight(canvas, ctx, v, canvas.width * 0.4);

			// rays
			var step = (v.numRays - 1) / 4;
			var r, g, b, str, nR;
			// loop drawing rays
			for (var i = 0; i < v.numRays; i++) {

				if (i < step) {
					r = 255;
					g = Math.floor(i * 255 * 5 / v.numRays);
					b = 0;
				} else if (i < step * 2) {
					r = 255 - Math.floor((i - step) * 255 * 5 / v.numRays);
					g = 255;
					b = 0;
				} else if (i < step * 3) {
					r = 0;
					g = 255;
					b = Math.floor((i - 2 * step) * 255 * 5 / v.numRays);
				} else {
					r = Math.floor(((i - 3 * step) * 255 * 5 / v.numRays) / 2);
					g = 255 - Math.floor((i - 3 * step) * 255 * 5 / v.numRays);
					b = 255;
				}
				str = "rgb(" + r + "," + g + "," + b + ")"; 
				nR = v.n * (1 + (i - (v.numRays - 1) / 2) * 0.05 / (v.numRays - 1)); 
				drawDispersionRay(canvas, ctx, nR, str, (canvas.width - v.prismWidthHalf) / 2, 0.22 * canvas.height + v.prismHeight / 2 - 1, v, xEnd)	
			}

		}
		// Prism 
		drawPrism(canvas, ctx, v);

		// wait
		await new Promise(r => setTimeout(r, 10));
	}
}

function showIntroduction() {
	document.getElementById("descriptionDiv").style.display = "none";
	document.getElementById("simDescriptionDiv").style.display = "none";
	document.getElementById("canvasDiv").style.display = "none";
	document.getElementById("introDiv").style.display = "block";
}

function showDescription() {
	document.getElementById("introDiv").style.display = "none";
	document.getElementById("simDescriptionDiv").style.display = "none";
	document.getElementById("canvasDiv").style.display = "none";
	document.getElementById("descriptionDiv").style.display = "block";
}

function showSimDescription() {
	document.getElementById("introDiv").style.display = "none";
	document.getElementById("descriptionDiv").style.display = "none";
	document.getElementById("canvasDiv").style.display = "none";
	document.getElementById("simDescriptionDiv").style.display = "block";
}

function showCanvas() {
	document.getElementById("introDiv").style.display = "none";
	document.getElementById("descriptionDiv").style.display = "none";
	document.getElementById("simDescriptionDiv").style.display = "none";
	document.getElementById("canvasDiv").style.display = "block";
	draw();
}
