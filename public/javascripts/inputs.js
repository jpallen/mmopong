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
		this.socket.emit("action", {action : this.action, state: "down"});
	},

	buttonRelease: function(e) {
		this.element.removeClass("active");
		this.socket.emit("action", {action : this.action, state: "up"});
	},
});
