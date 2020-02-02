var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var replySchema = new Schema ({
	user: String,
	content: String,
	created: Date
});

module.exports = mongoose.model('reply', replySchema);