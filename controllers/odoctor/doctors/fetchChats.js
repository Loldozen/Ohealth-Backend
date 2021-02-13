const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

// const User = require('../../../models/ohealth/User')
const Doctor = require('../../../models/odoctor/Doctor')
// const Appointment = require('../../../models/both/Appointment')
const Chat = require('../../../models/both/Chat')

router.post('/', [
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('appointmentID').notEmpty().withMessage('appointment ID is required').bail().isString().withMessage('appointment ID is not valid').bail().isLength({ min: 5, max: 40 }).withMessage('appointment ID can only be between 5 and 40 chars'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, mdcnNumber, appointmentID } = request.body
	Doctor.findOne({ mdcnNumber, currentToken }, function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}

		Chat.find({ appointmentID }, function (err, chats) {
			if (!chats) {
				// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
				return response.send({ error: true })
			}
			// console.log(appointments)
			return response.send({ success: true, chats })

		}).catch(next)

	}).catch(next)

})

module.exports = router