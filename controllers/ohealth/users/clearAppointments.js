const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Appointment = require('../../../models/both/Appointment')

router.post('/', [
	body('userID').notEmpty().withMessage('UserID is required'),
	body('currentToken').notEmpty().withMessage('token is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, userID, } = request.body
	User.findOne({ _id: userID, currentToken }, function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}



		Appointment.deleteMany({ $and: [{ userID }, { $and: [{ status: { $ne: 'Ongoing' } }, { type: { $ne: 'Chat' } }] }] }, function (err, appointments) {

			if (err) {
				console.log(err)
			}
			return response.send({ success: true })
		})

			.catch(next)


	}).catch(next)

})

module.exports = router