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
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, doctorID, } = request.body
	Doctor.findOne({ _id: doctorID, currentToken }, function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}



		Appointment.deleteMany({ $and: [{ doctorID }, { $and: [{ status: { $ne: 'Ongoing' } }, { type: { $ne: 'Chat' } }] }] }, function (err, appointments) {

			if (err) {
				console.log(err)
			}
			return response.send({ success: true })
		})

			.catch(next)


	}).catch(next)

})

module.exports = router