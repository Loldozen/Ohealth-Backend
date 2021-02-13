const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransactionSchema = new Schema({
	userID: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	appointmentID: {
		type: ObjectId,
	},
	type: {
		type: String,
		enum: ['Credit', 'Debit'],
		required: true
	},
	description: {
		type: String,
		required: true
	},
	timestamp: {
		type: String,
		default: new Date(),
		required: true
	},
	amount: {
		type: Number,
		required: true,
	}
})

const Transaction = mongoose.model('Transaction', TransactionSchema)
module.exports = Transaction