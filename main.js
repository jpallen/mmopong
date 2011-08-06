var express  = require("express"),
    socketio = require("socket.io");

var Client = require('./client.js');

var app = express.createServer();
var io = socketio.listen(app);

var clients = [];
io.sockets.on('connection', function (socket) {
	var client = new Client({
		socket : socket
	});
	clients.push(client);
	
	client.onDisconnect(function() {
		var index = clients.indexOf(client);
		if (index != -1) clients.splice(index, 1);
	});
});

app.use(express.static(__dirname + "/public"));

app.get("/stream/:game", function(req, res, next) {
	var data = '';
	for (var j = 0; j < clients.length; j++) {
		client = clients[j];
		if (client.game == req.params.game) {
			data += client.group + "," + client.id + "," + client.state + "\n";
		}
	}
	res.end(data);
});

setInterval(function() {
}, 100);

var port;
if (process.argv[2]) {
	port = parseInt(process.argv[2], 10)
} else {
	port = 3000;
}
app.listen(port, "10.59.2.148");
