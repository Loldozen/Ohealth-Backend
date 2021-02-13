const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const Doctor = require('../../../models/odoctor/Doctor')

router.post('/', [
	body('name').notEmpty().withMessage('Name is required').bail().matches(new RegExp(`^[a-zA-Z ]+$`)).withMessage('Name contains invalid characters').bail().isLength({ min: 3, max: 25 }).withMessage('Name can only be between 3 and 25 chars long'),
	body('email').notEmpty().withMessage('Email is empty').bail().isEmail().withMessage('Email is not valid'),
	body('phoneNumber').notEmpty().withMessage('Phone number is required').bail().isMobilePhone().withMessage('Phone number is not valid').bail().isLength({ min: 11, max: 11 }).withMessage('Phone number can only be 11 chars long'),
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('gender').notEmpty().withMessage('Gender is required').bail().isString().withMessage('Gender is not valid').bail().isIn(['Male', 'Female', 'Others']),
	body('password').notEmpty().withMessage('Password is required').bail().isLength({ min: 5, max: 24 }).withMessage('Password should be of length between 5 and 24'),
	body('cpassword').notEmpty().withMessage('Confirm Password is required').bail().custom((value, { req }) => value === req.body.password).withMessage('Password does not match'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}
	let { email, phoneNumber, password, name, gender, mdcnNumber, specialization, languages } = request.body
	let newDoctor = {
		email: email, phoneNumber, name, gender, mdcnNumber, specialization, languages, uniqueID: UniqueValue(100).substr(0, 6)
	}

	bcrypt.hash(password, 10, function (err, hash) {
		newDoctor.password = hash,
			Doctor.create(newDoctor).then(function (doc) {
				let doctor = { email: doc.email, _id: doc._id }
				return response.send({ doctor, success: true })
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