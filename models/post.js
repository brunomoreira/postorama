var mongoose = require('mongoose'),
	Schema   = mongoose.Schema;

var postSchema = new Schema({
	title: String,
	content: String,
	author: { type: Schema.Types.ObjectId, ref: 'user' },
	replies: [{type: Schema.Types.ObjectId, ref: 'reply'}],
	likes: [{ type: String }],
	created: Date
});	

module.exports = mongoose.model('post', postSchema);