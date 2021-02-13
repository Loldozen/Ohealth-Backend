const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TransferSchema = new Schema({
	doctorID: {
		type: mongoose.Types.ObjectId,

	},
	transactionID: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	transferCode: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	reference: {
		type: String
	},
	id: {
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
		enum: ['Pending', 'Success', 'OTP', 'Failed']
	}
})

const Transfer = mongoose.model('Transfer', TransferSchema)
module.exports = Transfer