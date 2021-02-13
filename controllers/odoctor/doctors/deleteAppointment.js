const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const Doctor = require('../../../models/odoctor/Doctor')
const Appointment = require('../../../models/both/Appointment')

router.post('/', [
	body('doctorID').notEmpty().withMessage('doctorID is required'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('appointmentID').notEmpty().withMessage('appointment ID is required').bail().isString().withMessage('appointment ID is not valid').bail().isLength({ min: 5, max: 40 }).withMessage('appointment ID can only be between 5 and 40 chars'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, doctorID, appointmentID } = request.body
	Doctor.findOne({ _id: doctorID, currentToken }, function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}





		Appointment.findOne({ _id: appointmentID, doctorID }, function (err, appointment) {
			if (!appointment) {
				//Invalid request
				return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			}


			Appointment.deleteOne({ _id: appointment._id }, function (err, appointment) {


				return response.send({ success: true })
			})

				.catch(next)


		}).catch(next)


	}).catch(next)

})

module.exports = router
