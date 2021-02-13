const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const Doctor = require('../../../models/odoctor/Doctor')

router.post('/', [
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('availability').isBoolean().withMessage('availability is invalid'),
	body('currentToken').notEmpty().withMessage('token is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, mdcnNumber, availability } = request.body
	Doctor.findOne({ mdcnNumber, currentToken }, function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}

		let updateDoc = {
			available: availability
		}

		Doctor.findOneAndUpdate({ mdcnNumber }, updateDoc, { new: true })
			.then(function (doc) {
				let doctor = doc.toObject()
				delete doctor.password
				delete doctor.__v
				delete doctor.fcm_token
				delete doctor.last_login
				delete doctor.socketID
				return response.send({ doctor })
			}).catch(next)

	}).catch(next)

})

module.exports = router