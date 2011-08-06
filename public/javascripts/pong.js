$(function() {

var canvas = $("#canvas")[0];
var ctx = canvas.getContext("2d");
canvas.style["background-color"] = "black";

function resizeCanvas() {
	canvas.width  = $(document.body).width();
	canvas.height = $(document.body).height();
}
resizeCanvas();
$(window).resize(resizeCanvas);

var batHeight = 120;
var batWidth  = 30
var ballRadius = 10;
var physicsTimeStep = 5;
var graphicsTimeStep = 20;

var leftBatPosition  = 0.5;
var rightBatPosition = 0.5;
var ballPosition     = [canvas.width / 2.0, canvas.height / 2.0];
var ballVelocity     = [300, 300];

var leftBatX = 40;
var leftBatY = canvas.height * leftBatPosition;
var rightBatX = canvas.width - 40;
var rightBatY = canvas.height * rightBatPosition;

function gameTick() {
	var newTime = (new Date()).getTime();
	var step = (newTime - prevTime);
	prevTime = newTime;
	
	while(step > physicsTimeStep) {
		step -= physicsTimeStep;
		physicsTick();
	}

	// Draw the fucker
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "green";

	ctx.fillRect(leftBatX - batWidth/2.0, leftBatY - batHeight/2.0, batWidth, batHeight);
	ctx.fillRect(rightBatX - batWidth/2.0, canvas.height * rightBatPosition - batHeight/2.0, batWidth, batHeight);

	// Ball
	ctx.fillRect(ballPosition[0] - ballRadius, ballPosition[1] - ballRadius, ballRadius * 2, ballRadius * 2);

}

function physicsTick() {
	var step = physicsTimeStep / 1000.0;

	ballPosition[0] += ballVelocity[0] * step;
	ballPosition[1] += ballVelocity[1] * step;

	if (ballPosition[0] < 0 || ballPosition[0] > canvas.width) ballVelocity[0] = -ballVelocity[0];
	if (ballPosition[1] < 0 || ballPosition[1] > canvas.height) ballVelocity[1] = -ballVelocity[1];

	// Bats
	leftBatX = 40;
	leftBatY = canvas.height * leftBatPosition;
	rightBatX = canvas.width - 40;
	rightBatY = canvas.height * rightBatPosition;

	// Is ball inside right of left paddle?
	if (ballPosition[0] < leftBatX + batWidth / 2.0 && ballPosition[0] > leftBatX - batWidth / 2.0 &&
	    ballPosition[1] < leftBatY + batHeight / 2.0 && ballPosition[1] > leftBatY - batHeight / 2.0) {
		ballVelocity[0] = -ballVelocity[0];
	}
	if (ballPosition[0] < rightBatX + batWidth / 2.0 && ballPosition[0] > rightBatX - batWidth / 2.0 &&
	    ballPosition[1] < rightBatY + batHeight / 2.0 && ballPosition[1] > rightBatY - batHeight / 2.0) {
		ballVelocity[0] = -ballVelocity[0];
	}
	
}

function updatePositions() {
$.ajax("/stream/pong", {
	success: function(data) {
		var lines = data.split("\n");
		var leftBatUpCount    = 0;
		var leftBatDownCount  = 0;
		var rightBatUpCount   = 0;
		var rightBatDownCount = 0;

		for(var i = 0; i < lines.length; i++) {
			var line = lines[i];
			var parts = line.split(",");
			if (parts[0] == "left_player") {
				if (parts[2] == "left") {
					leftBatUpCount += 1;
				}
				if (parts[2] == "right") {
					leftBatDownCount += 1;
				}
			}
			if (parts[0] == "right_player") {
				if (parts[2] == "left") {
					rightBatUpCount += 1;
				}
				if (parts[2] == "right") {
					rightBatDownCount += 1;
				}
			}
		}
		if (leftBatUpCount + leftBatDownCount == 0) {
			leftBatPosition = 0.5;
		} else {
			leftBatPosition = leftBatDownCount / (leftBatUpCount + leftBatDownCount);
		}
		if (rightBatUpCount + rightBatDownCount == 0) {
			rightBatPosition = 0.5;
		} else {
			rightBatPosition = rightBatDownCount / (rightBatUpCount + rightBatDownCount);
		}
		console.log(leftBatPosition);
	}
});

}

var prevTime = (new Date()).getTime();

setInterval(updatePositions, 100);
setInterval(gameTick, graphicsTimeStep);

});
