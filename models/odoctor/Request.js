const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RequestSchema = new Schema({
	userID: {
		type: ObjectId,
		required: true,
	},
	doctorID: {
		type: ObjectId,
		required: true
	},
	type: {
		type: String,
		enum: ['Chat', 'Call', 'Video'],
		required: true
	},
	scheduleTime: {
		type: String
	},
	timestamp: {
		type: String,
		required: true,
		default: new Date(),
	},
	status: {
		type: String,
		enum: ['Pending', 'Ongoing', 'Completed', 'Cancelled'],
		required: true,
		default: 'Pending'
	}
})

const Request = mongoose.model('Request', RequestSchema)
module.exports = Request