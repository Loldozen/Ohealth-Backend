const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const Doctor = require('../../../models/odoctor/Doctor')

router.post('/', [
	body('name').notEmpty().withMessage('Name is required').bail().matches(new RegExp(`^[a-zA-Z ]+$`)).withMessage('Name contains invalid characters').bail().isLength({ min: 3, max: 25 }).withMessage('Name can only be between 3 and 25 chars long'),
	body('phoneNumber').notEmpty().withMessage('Phone number is required').bail().isMobilePhone().withMessage('Phone number is not valid').bail().isLength({ min: 11, max: 11 }).withMessage('Phone number can only be 11 chars long'),
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('gender').isString().withMessage('Gender is not valid').bail().isIn(['Male', 'Female', 'Others']),
	body('currentToken').notEmpty().withMessage('token is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, mdcnNumber, } = request.body
	Doctor.findOne({ mdcnNumber, currentToken }, function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}

		let { name, gender, DOB, phoneNumber, country, state, address, specialization, languages } = request.body
		let updateDoc = {
			name, gender, DOB, phoneNumber, country, state, address, specialization, languages
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