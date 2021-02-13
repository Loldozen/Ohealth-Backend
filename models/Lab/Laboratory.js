const mongoose = require('mongoose')
const Schema = mongoose.Schema


const LabSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		lowercase: true,
		trim: true,
	},
	phoneNumber: {
		type: String,
		required: true,
		trim: true
	},
	avatar: {
		type: String
	},
	password: {
		type: String,
		required: true
	},
	wallet: {
		type: Number,
		default: 0.00
	},
	verified: {
		type: Boolean,
		default:false
	},
	capacityPerDay: {
		type: String
	},
	accountName: {
		type: String,
	},
	accountNumber: {
		type: String
	},
	bankName: {
		type: String
	},
	testCost: {
		type: String
	},
	country: {
		type: String
	},
	state: {
		type: String
    },
    city: {
        type: String
    },
	street: {
		type: String
	},
	currentToken: {
		type: String
	},	
	uniqueID: {
		type: String
	},
	notifications: {
		type: Array
	},
	recoveryCode: {
		type: String
	}
})

const Laboratory = mongoose.model('Laboratory', LabSchema)
module.exports = Laboratory
