
var mongoose = require('mongoose');
var mongoURI = 'mongodb://localhost:/chat-mongodb';
var db = mongoose.connect(mongoURI);
var ChatMessage = require('./ChatMessage');

var io = require('socket.io').listen(4242);
io.set('log level', 1);

io.sockets.on('connection', function (socket) {

	socket.on('userConnected', function (username) {
		socket.broadcast.emit('chatMessage', {username:"System", message: username + " has connected to the server!"});
		socket.set('username', username);

		ChatMessage.getLastMessages(10, function (messages) {
			for (var i = messages.length-1; i >= 0; --i) {
				var data = messages[i];
				delete data._id;
				delete data.__v;
				socket.emit('chatMessage', data);
			}
		});

	});

	socket.on('chatMessage', function (data) {

		io.sockets.emit('chatMessage', data);

		var msg = new ChatMessage ();
		msg.username = data.username;
		msg.message = data.message;
		msg.date = new Date ();
		msg.save();

	});

	socket.on('disconnect', function () {
		socket.get('username', function (err, username) {
			socket.broadcast.emit('chatMessage', {username:"System", message: username + " has disconnected from the server!"});
		});
	});

});

//server OP