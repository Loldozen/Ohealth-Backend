const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')

router.post('/', [
	body('name').notEmpty().withMessage('Name is required').bail().matches(new RegExp(`^[a-zA-Z ]+$`)).withMessage('Name contains invalid characters').bail().isLength({ min: 3, max: 25 }).withMessage('Name can only be between 3 and 25 chars long'),
	body('phoneNumber').notEmpty().withMessage('Phone number is required').bail().isMobilePhone().withMessage('Phone number is not valid').bail().isLength({ min: 11, max: 11 }).withMessage('Phone number can only be 11 chars long'),
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('gender').isString().withMessage('Gender is not valid').bail().isIn(['Male', 'Female', 'Others']),
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

		let { name, phoneNumber, country, state, address, gender, DOB, bloodGroup, genotype, height, weight, } = request.body
		let updateDoc = {
			name, phoneNumber, country, state, address, gender, DOB, bloodGroup, genotype, height, weight,
		}

		User.findOneAndUpdate({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' } }, updateDoc, { new: true })
			.then(function (user) {
				let newUser = user.toObject()
				delete newUser.password
				delete newUser.__v
				delete newUser.fcm_token
				delete newUser.last_login
				delete newUser.socketID
				return response.send({ user: newUser })
			}).catch(next)

	}).catch(next)

})

module.exports = router
