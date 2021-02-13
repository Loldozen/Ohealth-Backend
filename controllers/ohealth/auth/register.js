const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')

router.post('/', [
	body('name').notEmpty().withMessage('Name is required').bail().matches(new RegExp(`^[a-zA-Z ]+$`)).withMessage('Name contains invalid characters').bail().isLength({ min: 3, max: 25 }).withMessage('Name can only be between 3 and 25 chars long'),
	body('email'),
	body('phoneNumber').notEmpty().withMessage('Phone number is required').bail().isMobilePhone().withMessage('Phone number is not valid').bail().isLength({ min: 11, max: 11 }).withMessage('Phone number can only be 11 chars long'),
	body('gender').notEmpty().withMessage('Gender is required').bail().isString().withMessage('Gender is not valid').bail().isIn(['Male', 'Female', 'Others']),
	body('password').notEmpty().withMessage('Password is required').bail().isLength({ min: 5, max: 24 }).withMessage('Password should be of length between 5 and 24'),
	body('cpassword').notEmpty().withMessage('Confirm Password is required').bail().custom((value, { req }) => value === req.body.password).withMessage('Password does not match'),
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	// body('DOB').notEmpty().withMessage('Date of Birth is required').bail().isString('Date of birth is Invalid'), 
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}
	let { email, phoneNumber, password, name, username, gender, DOB, bloodGroup, genotype, height, weight, } = request.body
	let newUser = {
		email: email, phoneNumber, name, gender, username: username.toLowerCase(), DOB, bloodGroup, genotype, height, weight, uniqueID: UniqueValue(100).substr(0, 6)
	}

	bcrypt.hash(password, 10, function (err, hash) {
		newUser.password = hash,
			User.create(newUser).then(function (user) {
				return response.send({ success: true })
			}).catch(next)
	})
})

module.exports = router

const UniqueValue = d => {
	var dat_e = new Date();
	var uniqu_e = ((Math.random() * 1000) + "").slice(-4)

	dat_e = dat_e.toISOString().replace(/[^0-9]/g, "").replace(dat_e.getFullYear(), uniqu_e);
	if (d == dat_e)
		dat_e = UniqueValue(dat_e);
	return dat_e;
}
