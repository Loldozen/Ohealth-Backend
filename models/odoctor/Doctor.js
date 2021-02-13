const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DoctorSchema = new Schema({
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
	mdcnNumber: {
		type: Number,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	photo: {
		type: String
	},
	wallet: {
		type: Number,
		default: 0.00
	},
	gender: {
		required: true,
		type: String,
		enum: ['Male', 'Female', 'Others']
	},
	DOB: {
		type: String
	},
	specialization: {
		type: String
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
		default: false
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
	acceptAudio: {
		type: Boolean,
		default: true
	},
	acceptVideo: {
		type: Boolean,
		default: true
	},
	fcm_token: {
		type: String
	},
	last_login: {
		type: Number,
	},
	languages: {
		type: Array,
		default: ['English']
	},
	uniqueID: {
		type: String
	},
	available: {
		type: Boolean,
		default: true
	},
	notifications: {
		type: Array
	},
	recoveryCode: {
		type: String
	}
})

const Doctor = mongoose.model('Doctor', DoctorSchema)
module.exports = Doctor
