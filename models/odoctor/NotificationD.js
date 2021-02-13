const mongoose = require('mongoose')
const Schema = mongoose.Schema



const NotificationDSchema = new Schema({
	doctorID: {
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

const NotificationD = mongoose.model('NotificationD', NotificationDSchema)
module.exports = NotificationD