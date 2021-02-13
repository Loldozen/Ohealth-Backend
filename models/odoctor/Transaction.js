const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransactionSchema = new Schema({
	doctorID: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	userID: {
		type: mongoose.Types.ObjectId,
		// required: true
	},
	appointmentID: {
		type: mongoose.Types.ObjectId,
	},
	type: {
		type: String,
		enum: ['Credit', 'Debit'],
		required: true
	},
	appointmentType: {
		type: String,
		enum: ['Chat', 'Audio', 'Video'],
	},
	description: {
		type: String
	},
	timestamp: {
		type: String,
		default: new Date(),
		required: true
	},
	amount: {
		type: Number,
		required: true,
	},
	status: {
		type: String,
		enum: ['Pending', 'Completed'],
		default: 'Pending'
	}
})

const Transaction = mongoose.model('Transaction', TransactionSchema)
module.exports = Transaction