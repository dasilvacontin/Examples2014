
var io = require('socket.io').listen(8000);
io.set('log level', 1);

var defaultUsername = "Anonymous";
var inactiveColor = "#FFFFFF";
var screenColor = inactiveColor;
var claimedColor = false;

function newRandomScreenColor () {
	screenColor = '#'+Math.floor(Math.random()*16777215).toString(16);
	claimedColor = false;
	io.sockets.emit('screenUpdate', {screenColor:screenColor});
}

var players = {};
playerCount = 0;

function Player (id) {
	this.id = id;
	players[id] = this;
	this.color = '#'+Math.floor(Math.random()*16777215).toString(16);
}
Player.prototype = {

	score : 0,
	username : defaultUsername,
	color : "#000000",

	updateWithData : function (data) {

		if (data.score !== undefined) this.score = data.score;
		if (data.username !== undefined) this.username = data.username;
		if (data.color !== undefined) this.color = data.color;

	}

}

io.sockets.on('connection', function (socket) {

	++playerCount;

	// Envía la lista de jugadores al nuevo jugador
	for (var playerId in players) socket.emit('playerUpdate', players[playerId]);
	socket.emit('screenUpdate', {screenColor:screenColor});

	// Crea el nuevo jugador y lo envía a todos
	var player = new Player (socket.id);
	io.sockets.emit('playerUpdate', player);

	socket.on('myUsername', function (username) {
		var player = players[socket.id];
		if (player === undefined) return;
		player.username = username;
		io.sockets.emit('playerUpdate', player);
	});

	socket.on('hit', function () {
		var player = players[socket.id];
		if (player === undefined) return;
		if (!claimedColor) {
			claimedColor = true;
			player.score += Math.floor(Math.random()*31)+20;
			io.sockets.emit('playerUpdate', player);
			screenColor = inactiveColor;
			io.sockets.emit('screenUpdate', {screenColor:screenColor});
			setTimeout(newRandomScreenColor, Math.random()*7*1000+500);
		} else {
			player.score -= Math.floor(Math.random()*8)+2;
			io.sockets.emit('playerUpdate', player);
		}
	});

	socket.on('disconnect', function () {
		--playerCount;
		delete players[socket.id];
		io.sockets.emit('playerDisconnect', socket.id);
	});

	if (playerCount == 2) {
		setTimeout(newRandomScreenColor, Math.random()*7*1000+500);
	}

});

newRandomScreenColor();