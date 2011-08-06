var Client = function(attributes) {
	this.initialize(attributes);
};

Client.nextId = function() {
	if (!Client.currentId) Client.currentId = 1;
	Client.currentId += 1;
	return Client.currentId;
}

Client.prototype.initialize = function(attributes) {
	this.socket = attributes.socket;
	this.id     = Client.nextId();

	this.state = "none";
	var self = this;

	this.socket.on("action", function(data) {
		self.state = data.state;
	});

	this.socket.on("addClient", function(data) {
		self.group = data.group;
		self.game  = data.game;
	}),

	this.socket.on("disconnect", function() {
		if (self.disconnectCallback) {
			self.disconnectCallback();
		}
	});
};

Client.prototype.onDisconnect = function(disconnectCallback) {
	this.disconnectCallback = disconnectCallback;
};

module.exports = Client;
