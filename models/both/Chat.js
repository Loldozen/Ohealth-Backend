const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ChatSchema = new Schema({
	userID: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	doctorID: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	appointmentID: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	sender: {
		type: String,
		enum: ['User', 'Doctor', 'System'],
		required: true
	},
	timestamp: {
		type: String,
		default: new Date(),
	},
	media: {
		type: Boolean,
		default: false
	},
	status: {
		type: String,
	},
	delivered: {
		type: Boolean,
		default: false
	}
})

const Chat = mongoose.model('Chat', ChatSchema)
module.exports = Chat