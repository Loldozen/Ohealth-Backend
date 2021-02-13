const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Doctor = require('../../../models/odoctor/Doctor')
const Appointment = require('../../../models/both/Appointment')

router.post('/', [
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('type'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, username, type } = request.body
	User.findOne({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' }, currentToken }, function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}

		let finder = { userID: user._id }
		if (type) {
			finder.status = type
		}
		Appointment.find(finder, null, { limit: 20, sort: { _id: 'descending' } }, function (err, appointments) {
			if (!appointments || appointments.length < 1) {
				// //Invalid credential
				// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
				return response.send({ success: true, appointments: [] })
			}
			// console.log(appointments)


			Doctor.find({}, function (err, doctors) {
				if (!doctors || doctors.length < 1) {

					return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
				}
				// console.log(doctors)
				let theAppointments = []
				for (let i in appointments) {
					// console.log(appointments[i])
					let { doctorID } = appointments[i]
					// console.log(doctorID)

					let doctorr = doctors.filter(d => {
						// console.log(doctorID)
						// console.log(d._id)
						return String(d._id) == String(doctorID)
					})

					// console.log(doctorr)
					if (doctorr.length > 0) {
						let newAppointment = (appointments[i]).toObject()
						delete newAppointment.__v
						newAppointment.doctorName = doctorr[0].name
						newAppointment.doctorPhoto = doctorr[0].photo
						theAppointments.push(newAppointment)
					}
				}
				// console.log(theAppointments)








				return response.send({ appointments: theAppointments, success: true })

			}).catch(next)


		}).catch(next)

	}).catch(next)

})

module.exports = router
