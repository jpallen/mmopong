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
var maxVelocity = 1;

var leftBatPosition  = 0.5;
var rightBatPosition = 0.5;
var leftBatVelocity  = 0;
var rightBatVelocity = 0;
var ballPosition     = [canvas.width / 2.0, canvas.height / 2.0];
var ballVelocity     = [300, 300];

var leftBatX = 40;
var leftBatY = canvas.height * leftBatPosition;
var rightBatX = canvas.width - 40;
var rightBatY = canvas.height * rightBatPosition;

var leftScore = 0;
var rightScore = 0;

var sleepTime = 0;

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
	ctx.fillStyle = "limegreen";

	ctx.fillRect(leftBatX - batWidth/2.0, leftBatY - batHeight/2.0, batWidth, batHeight);
	ctx.fillRect(rightBatX - batWidth/2.0, canvas.height * rightBatPosition - batHeight/2.0, batWidth, batHeight);

	// Ball
	ctx.fillRect(ballPosition[0] - ballRadius, ballPosition[1] - ballRadius, ballRadius * 2, ballRadius * 2);

	// Net
	for (var i = 0; i<canvas.height; i+=80){
		ctx.fillRect(canvas.width/2.0-5,i,10,40);
	}

	//Score
	ctx.font = "bold 30px monospace";
	ctx.textBaseline = "middle";
	ctx.fillText (leftScore, (canvas.width/2.0)-75, 30);
	ctx.fillText (rightScore, (canvas.width/2.0)+60, 30);
}

function physicsTick() {
	var step = physicsTimeStep / 1000.0;
	var newTime = (new Date()).getTime();

	if (newTime < sleepTime)
		return;

	// Bats
	leftBatPosition += leftBatVelocity * step;
	rightBatPosition += rightBatVelocity * step;
	if (leftBatPosition < 0) leftBatPosition = 0;
	if (leftBatPosition > 1) leftBatPosition = 1;
	if (rightBatPosition < 0) rightBatPosition = 0;
	if (rightBatPosition > 1) rightBatPosition = 1;
	

	leftBatX = 80;
	leftBatY = canvas.height * leftBatPosition;
	rightBatX = canvas.width - 80;
	rightBatY = canvas.height * rightBatPosition;

	var ballPositionNew=[];

	ballPositionNew[0] = ballPosition[0] + ballVelocity[0]*step;
	ballPositionNew[1] = ballPosition[1] + ballVelocity[1]*step;

	// Is ball off the right hand side
	if (ballPositionNew[0] >= canvas.width) {
		leftScore++;
		ballPosition[0] = canvas.width/2.0;
		ballPosition[1] = canvas.height/2.0;
		ballVelocity[0]=-ballVelocity[0];
		ballVelocity[1]=-ballVelocity[1];
		sleepTime = (new Date()).getTime()+1000;
	} else if (ballPositionNew[0] <= 0) {
		rightScore++;
		ballPosition[0] = canvas.width/2.0;
		ballPosition[1] = canvas.height/2.0;
		ballVelocity[0]=-ballVelocity[0];
		ballVelocity[1]=-ballVelocity[1];
		sleepTime = (new Date()).getTime()+1000;
	}

	// Is ball inside right of left paddle?
	if (ballPositionNew[0] < leftBatX + batWidth/2.0 + ballRadius && ballPositionNew[0] > leftBatX - batWidth/2.0 - ballRadius &&
	    ballPositionNew[1] < leftBatY + batHeight/2.0 + ballRadius && ballPositionNew[1] > leftBatY - batHeight/2.0 - ballRadius) {
		if (ballPosition[1] > leftBatY + batHeight/2.0 || ballPosition[1] < leftBatY - batHeight/2.0) {
			ballVelocity[1]=-ballVelocity[1];
		}
		else{
			ballVelocity[0] = -ballVelocity[0];
		}
	}
	
	if (ballPositionNew[0] < rightBatX + batWidth/2.0 + ballRadius && ballPositionNew[0] > rightBatX - batWidth/2.0 - ballRadius &&
	    ballPositionNew[1] < rightBatY + batHeight/2.0 + ballRadius && ballPositionNew[1] > rightBatY - batHeight/2.0 + ballRadius) {
		if (ballPosition[1] > rightBatY + batHeight/2.0 || ballPosition[1] < rightBatY - batHeight/2.0) {
			ballVelocity[1]=-ballVelocity[1];
		}
		else{
			ballVelocity[0] = -ballVelocity[0];
		}
	}

	if (ballPosition[0] < 0 || ballPosition[0] > canvas.width) ballVelocity[0] = -ballVelocity[0];
	if (ballPosition[1] < 0 || ballPosition[1] > canvas.height) ballVelocity[1] = -ballVelocity[1];

	ballPosition[0] += ballVelocity[0] * step;
	ballPosition[1] += ballVelocity[1] * step;
	
}

function updatePositions() {
$.ajax("/stream/pong", {
	success: function(data) {
		var lines = data.split("\n");
		
		var leftBatCount      = 0;
		var rightBatCount     = 0;
		
		var leftBatUpCount    = 0;
		var leftBatDownCount  = 0;
		var rightBatUpCount   = 0;
		var rightBatDownCount = 0;

		for(var i = 0; i < lines.length; i++) {
			var line = lines[i];
			var parts = line.split(",");
			if (parts[0] == "left_player") {
				leftBatCount++;
				if (parts[2] == "left") {
					leftBatUpCount += 1;
				}
				if (parts[2] == "right") {
					leftBatDownCount += 1;
				}
			}
			if (parts[0] == "right_player") {
				rightBatCount++;
				if (parts[2] == "left") {
					rightBatUpCount += 1;
				}
				if (parts[2] == "right") {
					rightBatDownCount += 1;
				}
			}
		}
	
		if (true) {	
			if (leftBatCount == 0) {
				leftBatPosition = 0.5;
			} else {
				//leftBatPosition = leftBatDownCount / (leftBatUpCount + leftBatDownCount);
				leftBatPosition = 0.5 + (leftBatDownCount/leftBatCount)/2 - (leftBatUpCount/leftBatCount)/2;
			}
			if (rightBatCount == 0) {
				rightBatPosition = 0.5;
			} else {
				//rightBatPosition = rightBatDownCount / (rightBatUpCount + rightBatDownCount);
				rightBatPosition = 0.5 + (rightBatDownCount/rightBatCount)/2 - (rightBatUpCount/rightBatCount)/2;
			}
		} else {
			if (leftBatCount == 0) {
				leftBatVelocity = 0;
			} else {
				leftBatVelocity = (leftBatDownCount - leftBatUpCount) / leftBatCount * maxVelocity;
			}
			if (rightBatCount == 0) {
				rightBatVelocity = 0;
			} else {
				rightBatVelocity = (rightBatDownCount - rightBatUpCount) / rightBatCount * maxVelocity;
			}
		}
	}
});

}

var prevTime = (new Date()).getTime();

setInterval(updatePositions, 100);
setInterval(gameTick, graphicsTimeStep);

});
