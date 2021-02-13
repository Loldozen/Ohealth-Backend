const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Beneficiary = require('../../../models/ohealth/Beneficiary')


router.post('/', [
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('currentToken').notEmpty().withMessage('token is required'),

	body('b_username').notEmpty().withMessage('Beneficiary Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Beneficiary Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Beneficiary Username can only be between 3 and 15 chars long'),
	body('b_name').notEmpty().withMessage('Beneficiary Name is required').bail().matches(new RegExp(`^[a-zA-Z ]+$`)).withMessage('Beneficiary Name contains invalid characters').bail().isLength({ min: 3, max: 25 }).withMessage('Beneficiary Name can only be between 3 and 25 chars long'),
	body('relationship').notEmpty().withMessage('Relationship is required'),
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


		Beneficiary.find({}, function (err, benefi) {
			if (!benefi || benefi.length < 4) {


				let { b_username, b_name, relationship } = request.body
				let newBeneficiary = {
					username: b_username, name: b_name, relationship
				}

				Beneficiary.create(newBeneficiary).then(function (beneficiary1) {

					let beneficiary = beneficiary1.toObject()
					delete beneficiary.__v
					return response.send({ beneficiary, success: true })
				}).catch(next)

			}

			else {
				return response.status(400).json({ error: "You already have up to 4 beneficiaries" })
			}


		}).catch(next)


	}).catch(next)




})

module.exports = router
