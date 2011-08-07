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

var tank1=[];
var tank2=[];

tank1[0]=300;
tank1[1]=300;
tank1[2]=1;

tank2[0]=500;
tank2[1]=500;
tank2[2]=2;

var bullet1=[];
var bullet1index=0;
var bullet2=[];
var bullet2index=0;

//bullet1[0] = {
//	x : 1,
//	y : 2,
//	angle  : 4
//}

var physicsTimeStep = 5;
var graphicsTimeStep = 20;

var tankWidth = 100/2;
var tankLength = 175/2;

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
	
	ctx.save();
	ctx.translate(tank1[0],tank1[1]);
	ctx.rotate(tank1[2]);
	ctx.fillRect(-tankWidth/2.0,-tankLength/2.0,tankWidth,tankLength);
	ctx.fillStyle = "green";
	ctx.fillRect(-tankWidth/10,0,tankWidth/5,tankLength*0.9);
	ctx.restore();
	
	ctx.save();
	ctx.translate(tank2[0],tank2[1]);
	ctx.rotate(tank2[2]);
	ctx.fillRect(-tankWidth/2.0,-tankLength/2.0,tankWidth,tankLength);
	ctx.fillStyle = "green";
	ctx.fillRect(-tankWidth/10,0,tankWidth/5,tankLength*0.9);
	ctx.restore();
}

function physicsTick() {
	var step = physicsTimeStep / 1000.0;
	
	tank1[0] += step * Math.cos(tank1[2]+Math.PI/2)*50;
	tank1[1] += step * Math.sin(tank1[2]+Math.PI/2)*50;
	tank2[0] += step * Math.cos(tank2[2]+Math.PI/2)*50;
	tank2[1] += step * Math.sin(tank2[2]+Math.PI/2)*50;
	
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
		
		if (leftBatUpCount + leftBatDownCount == 0) {
			tank1[2] = 0;
		} else {
			//leftBatPosition = leftBatDownCount / (leftBatUpCount + leftBatDownCount);
			tank1[2] = (leftBatDownCount/leftBatCount)/2 - (leftBatUpCount/leftBatCount)/2;
		}
		if (rightBatUpCount + rightBatDownCount == 0) {
			tank2[2] = 0;
		} else {
			//rightBatPosition = rightBatDownCount / (rightBatUpCount + rightBatDownCount);
			tank2[2] = (rightBatDownCount/rightBatCount)/2 - (rightBatUpCount/rightBatCount)/2;
		}
		console.log(leftBatPosition);
	}
});

}

var prevTime = (new Date()).getTime();

setInterval(updatePositions, 100);
setInterval(gameTick, graphicsTimeStep);

});
