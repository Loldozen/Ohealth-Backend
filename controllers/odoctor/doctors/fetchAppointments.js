const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Doctor = require('../../../models/odoctor/Doctor')
const Appointment = require('../../../models/both/Appointment')

router.post('/', [
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('type'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, mdcnNumber, type } = request.body
	Doctor.findOne({ mdcnNumber, currentToken }, function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}
		let finder = { doctorID: doctor._id }
		if (type) {
			finder.status = type
		}
		Appointment.find(finder, null, { sort: { _id: 'descending' }, limit: 20 }, function (err, appointments) {
			if (!appointments || appointments.length < 1) {
				// //Invalid credential
				// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
				return response.send({ success: true, appointments: [] })
			}
			// console.log(appointments)


			User.find({}, function (err, users) {
				if (!users || users.length < 1) {

					return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
				}

				let theAppointments = []
				for (let i in appointments) {
					// console.log(appointments[i])
					let { userID } = appointments[i]
					// console.log(userID)

					let userr = users.filter(d => {
						// console.log(userID)
						// console.log(d._id)
						return String(d._id) == String(userID)
					})
					if (userr[0]) {
						// console.log(userr[0])
						let newAppointment = (appointments[i]).toObject()
						delete newAppointment.__v
						newAppointment.userName = userr[0].name
						newAppointment.userPhoto = userr[0].photo
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