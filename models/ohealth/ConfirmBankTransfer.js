const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ConfirmBankTransferSchema = new Schema({
	userID: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	fundedUsername: {
		type: String,
		required: true
	},
	fundedPhone: {
		type: String,
		required: true
	},
	nameOnTransaction: {
		type: String,
		required: true
	},
	senderPhone: {
		type: String,
		required: true
	},
	timestamp: {
		type: String,
		default: new Date(),
		required: true
	},
	image: {
		type: String
	},
	confirmed: {
		type: Boolean,
		default: false
	},
	amount: {
		type: Number,
		required: true,
	}
})

const ConfirmBankTransfer = mongoose.model('ConfirmBankTransfer', ConfirmBankTransferSchema)
module.exports = ConfirmBankTransfer
