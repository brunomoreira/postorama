var mongoose = require('mongoose'),
	Schema 	 = mongoose.Schema;

var userSchema = new Schema ({
	email: { type: String, unique: true },
	password: { type: String, unique: true, default: null, sparse: true },
	created: Date,
	ipAddress: { type: String, unique: true },
	admin: { type: Boolean, default: false },
	applied: { type: Boolean, default: false },
	owner: { type: Boolean, default: false }
});	

module.exports = mongoose.model('user', userSchema);