const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AdminSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	phoneNumber: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	password: {
		type: String,
		required: true
	},
	gender: {
		type: String,
		enum: ['Male', 'Female', 'Others']
	},
	country: {
		type: String
	},
	state: {
		type: String
	},
	address: {
		type: String
	},
	verified: {
		type: Boolean,
		default: true
	},
	currentToken: {
		type: String,
		default: ' '
	},
	socketID: {
		type: String,
		default: ' '
	},
	online: {
		type: Boolean,
		default: false
	},
	priviledge: {
		type: Number,
		default: 1
	},
	log: {
		type: String
	}
})

const Admin = mongoose.model('Admin', AdminSchema)
module.exports = Admin