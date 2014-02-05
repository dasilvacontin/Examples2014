
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = mongoose.ObjectId;

var ChatMessageSchema = new Schema ({

	username : {type: String},
	message : {type: String},
	date : {type:Date}

});

/* METHODS */

/*
ChatMessageSchema.methods.getUsername = function () {
	return this.username;
}
*/

/* STATICS */

ChatMessageSchema.statics.getLastMessages = function (n, callback) {
	if (n <= 0) callback([]);
	var query = this.find();
	query.sort({_id:'desc'}).limit(n).exec(function (err, messages) {
		if (err) throw err;
		callback(messages);
	});
}

mongoose.model('ChatMessage', ChatMessageSchema);
var ChatMessage = mongoose.model('ChatMessage');
module.exports = ChatMessage;