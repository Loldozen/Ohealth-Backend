const mongoose = require('mongoose')
const Schema = mongoose.Schema


const BookUserSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		lowercase: true,
	},
	phoneNumber: {
		type: String,
		required: true,
	},
    labID: {
        required: true,
		type: String
	},
	userID: {
        required: true,
		type: String
	},
	gender:{
		type: String
	},
	bookedDate:{
		type: String,
		required: true
	},
	notifications: {
		type: Array
    },
    status: {
        type: Boolean,
        default: false
    }
})

const LabBooking = mongoose.model('LabBooking', BookUserSchema)
module.exports = LabBooking
