window.Voter = {}

Voter.InputButton = function(attributes) {
	this.initialize(attributes);
};

$.extend(Voter.InputButton.prototype, {
	initialize: function(attributes) {
		this.element = attributes.element;
		this.action  = attributes.action;
		
		if (!window.socket) {
			window.socket = io.connect(document.location.host);
		}
		this.socket = window.socket;

		this.socket.emit("addClient", { 
			group : Voter.group,
			game  : Voter.game
		}); 

		var self = this;
		this.element.bind("mousedown", function(e) {
			self.buttonPress(e);
		});
		this.element.bind("mouseup", function(e) {
			self.buttonRelease(e);
		});
		this.element.bind("touchstart", function(e) {
			self.buttonPress(e);
		});
		this.element.bind("touchstop", function(e) {
			self.buttonRelease(e);
		});
	},

	buttonPress: function(e) {
		this.element.addClass("active");
		this.socket.emit("action", {state : this.action});
	},

	buttonRelease: function(e) {
		this.element.removeClass("active");
		this.socket.emit("action", {state : "none"});
	},
});

Voter.TouchPanel = function(attributes) {
	this.initialize(attributes);
}

$.extend(Voter.TouchPanel.prototype, {
	initialize: function(attributes) {
		this.element = attributes.element;
		
		if (!window.socket) {
			window.socket = io.connect(document.location.host);
		}
		this.socket = window.socket;

		this.socket.emit("addClient", { 
			group : Voter.group,
			game  : Voter.game
		}); 

		this.mouseDown = false;

		var self = this;
		this.element.bind("mousedown", function(e) {
			self.buttonPress(e);
		});
		this.element.bind("mouseup", function(e) {
			self.buttonRelease(e);
		});
		this.element.bind("mousemove", function(e) {
			self.move(e);
		});
		this.element.bind("touchstart", function(e) {
			self.buttonPress(e);
		});
		this.element.bind("touchmove", function(e) {
			self.move(e);
		});
		this.element.bind("touchstop", function(e) {
			self.buttonRelease(e);
		});
	},
	
	getPositionFromEvent: function(e) {
			var offsetX, offsetY;
		if (e.originalEvent.targetTouches) {
			offsetX = e.originalEvent.targetTouches[0].pageX;
			offsetY = e.originalEvent.targetTouches[0].pageY;
		} else {
			offsetX = e.pageX;
			offsetY = e.pageY;
		}
		
		return {
			x : offsetX * 100.0 / $(window).width(),
			y : offsetY * 100.0 / $(window).height()
		};
	},

	buttonPress: function(e) {
		this.mouseDown = true;
		var pos = this.getPositionFromEvent(e);
		this.socket.emit("action", {state: pos.x + ":" + pos.y});
	},
	
	move: function(e) {
		if (this.mouseDown) {
			var pos = this.getPositionFromEvent(e);
			this.socket.emit("action", {state: pos.x + ":" + pos.y})
		}
	},

	buttonRelease: function(e) {
		this.mouseDown = false;
		this.socket.emit("action", {state: "none"});
	},

});
