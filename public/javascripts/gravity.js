$(function(){
	var canvas = $("#canvas")[0];
	canvas.style["background-color"] = "#000";
	var ctx = canvas.getContext("2d");

	function resizeCanvas() {
		canvas.width = $(document.body).width();
		canvas.height = $(document.body).height();
	}
	resizeCanvas();

	$(window).resize(resizeCanvas);

	function drawCircle(x,y,radius) {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI*2, true); 
		ctx.closePath();
		ctx.fill();	
	}

	function getLength(vec) {
		return Math.sqrt(
			vec[0]*vec[0] + vec[1]*vec[1]
		);
	}

	function getUnitVector(vec) {
		var length = getLength(vec);
		return [vec[0]/length, vec[1]/length];
	}

	objects = [];
	for (var i = 0; i < 3000; i++) {	
		objects.push({
			position : [Math.random() * canvas.width,Math.random() * canvas.height],
			velocity : [Math.random() * 1 - 0.5,Math.random() * 1 - 0.5]
		});
	}

	var maxForce = 50;
	var maxVelocity = 2.5;
	var damping = 0.5;
	gravityWells = [];

	function gameTick() {
		var time = (new Date()).getTime();
		var step = ( time - prevTime ) / 10.0;
		prevTime = time;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	
		for (var i = 0; i < objects.length; i++) {
			var object = objects[i];
			var force = [0,0];
			for (var j = 0; j < gravityWells.length; j++) {
				var gravityWell = gravityWells[j];
				var displacement = [
					gravityWell.position[0] - object.position[0],
					gravityWell.position[1] - object.position[1]
				];
				var distance = getLength(displacement);
				if (distance < 10) distance = 10;
				var direction = getUnitVector(displacement);
				force[0] += direction[0] * gravityWell.strength / (distance * distance); 
				force[1] += direction[1] * gravityWell.strength / (distance * distance);

				if (force[0] > maxForce) force[0] = maxForce;
				if (force[0] < -maxForce) force[0] = -maxForce;
				if (force[1] > maxForce) force[1] = maxForce;
				if (force[1] < -maxForce) force[1] = -maxForce;
			}

			object.velocity[0] += step * force[0];
			object.velocity[1] += step * force[1];
			var velocity = object.velocity;

			if (velocity[0] > maxVelocity) velocity[0] = maxVelocity;
			if (velocity[0] < -maxVelocity) velocity[0] = -maxVelocity;
			if (velocity[1] > maxVelocity) velocity[1] = maxVelocity;
			if (velocity[1] < -maxVelocity) velocity[1] = -maxVelocity;

			object.position[0] += step * object.velocity[0];
			object.position[1] += step * object.velocity[1];

			if (object.position[0] < 0) {
				if (object.velocity[0] < 0) object.velocity[0] = -damping*object.velocity[0];
			}
			if (object.position[0] > canvas.width) {
				if (object.velocity[0] > 0) object.velocity[0] = -damping*object.velocity[0];
			}
			if (object.position[1] < 0) {
				if (object.velocity[1] < 0) object.velocity[1] = -damping*object.velocity[1];
			}
			if (object.position[1] > canvas.height) {
				if (object.velocity[0] > 0) object.velocity[1] = -damping*object.velocity[1];
			}

			var speed = getLength(object.velocity);
			var maxSpeed = Math.sqrt(2) * maxVelocity;
			var colourValue = Math.log(speed + 1);
			var maxColourValue = Math.log(maxSpeed + 1);
			var redness = Math.floor(colourValue / maxColourValue * 255);
			var greenness = 0;
			ctx.fillStyle = "rgb(" + redness + "," + greenness + ",0)";
	
			drawCircle(object.position[0], object.position[1], 5);
		}
	};

	function updateGravityWells() {
		$.ajax("/stream/gravity", {
			success: function(data) {
				var lines = data.split("\n");
				gravityWells = [];
				for(var i = 0; i < lines.length; i++) {
					var line = lines[i];
					var parts = line.split(",");
					if (parts.length > 2) {
						var coords = parts[2].split(":");
						if (coords.length == 2) {
							var x = parseFloat(coords[0]) / 100.0;
							var y = parseFloat(coords[1]) / 100.0;
							gravityWells.push({
								position : [x * canvas.width, y * canvas.height],
								strength : 30
							});
						}
					}
				}
			}
		});
	};

	var prevTime = (new Date()).getTime();	

	setInterval(gameTick, 100); 
	setInterval(updateGravityWells, 100);
});
