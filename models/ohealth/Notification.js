const mongoose = require('mongoose')
const Schema = mongoose.Schema



const NotificationSchema = new Schema({
	userID: {
		type: mongoose.Types.ObjectId,
		required: true
	},

	title: {
		type: String,
		required: true
	},
	message: {
		type: String
	},
	timestamp: {
		type: String,
		default: new Date(),
	},
	seen: {
		type: Boolean,
		default: false
	}

})

const Notification = mongoose.model('Notification', NotificationSchema)
module.exports = Notification