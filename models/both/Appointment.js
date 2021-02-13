const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AppointmentSchema = new Schema({
	userID: {
		type: mongoose.Types.ObjectId,
		required: true,
	},
	doctorID: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	type: {
		type: String,
		enum: ['Chat', 'Audio', 'Video'],
		required: true
	},
	timestamp: {
		type: String,
		required: true,
		default: new Date(),
	},
	duration: {
		type: String,
	},
	endTime: {
		type: String,
	},
	status: {
		type: String,
		enum: ['Waiting', 'Ongoing', 'Completed', 'Cancelled'],
		required: true,
		default: 'Waiting'
	}
})

const Appointment = mongoose.model('Appointment', AppointmentSchema)
module.exports = Appointment