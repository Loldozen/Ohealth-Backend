const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Appointment = require('../../../models/both/Appointment')
const Doctor = require('../../../models/odoctor/Doctor')


router.post('/', [
	body('userID').notEmpty().withMessage('UserID is required'),
	body('doctorID').notEmpty().withMessage('doctorID is required'),
	body('type').notEmpty().withMessage('type is required').bail().isString().withMessage('type is not valid').bail().isIn(['Chat']),
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('currentToken').notEmpty().withMessage('token is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, username, } = request.body

	User.findOne({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' }, currentToken }, function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}

		let { userID, doctorID, type, } = request.body

		Doctor.findOne({ _id: doctorID }, function (err, doctor) {
			if (!doctor) {
				//Invalid credential
				return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			}
			if ((!doctor.verified) || (!doctor.fcm_token)) {
				return response.status(400).json({ error: "Doctor cannot be reached at this time, please try again" })
			}
			// timestamp = timestamp || new Date()
			Appointment.findOne({ userID, doctorID, type, status: 'Ongoing' }, async function (err, appointment) {
				if (appointment) {

					return response.send({ success: true, appointment: { _id: appointment._id } })

				}

				else {
					return response.send({ success: true, appointment: false })
				}

			}).catch(next)

		}).catch(next)

	}).catch(next)

})

module.exports = router
