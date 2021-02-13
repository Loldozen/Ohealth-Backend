const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const bcrypt = require('bcrypt')
const privateKey = fs.readFileSync('./private.key')

const Admin = require('../../models/admin/Admin')
const Settings = require('../../models/both/Settings')
const { settings } = require('cluster')
router.get('/', function (req, res) {
	res.render('register', { pagetitle: 'Admin Registration' });
});

router.post('/', [
	body('name').notEmpty().withMessage('Name is required').bail().matches(new RegExp(`^[a-zA-Z ]+$`)).withMessage('Name contains invalid characters').bail().isLength({ min: 3, max: 25 }).withMessage('Name can only be between 3 and 25 chars long'),
	body('email').notEmpty().withMessage('Email is empty').bail().isEmail().withMessage('Email is not valid'),
	body('phoneNumber').notEmpty().withMessage('Phone number is required').bail().isMobilePhone().withMessage('Phone number is not valid').bail().isLength({ min: 11, max: 11 }).withMessage('Phone number can only be 11 chars long'),
	body('password').notEmpty().withMessage('Password is required').bail().isLength({ min: 5, max: 24 }).withMessage('Password should be of length between 5 and 24'),
	body('cpassword').notEmpty().withMessage('Confirm Password is required').bail().custom((value, { req }) => value === req.body.password).withMessage('Password does not match'),
], async function (request, response,) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.render('register', { pagetitle: 'Admin Registration', errors: errors.array() });
	}

	let { email, phoneNumber, password, name } = request.body
	let newAdmin = {
		email, phoneNumber, name
	}

	let setting = await getSettings()

	if (!setting.adminRegistration) {
		return response.render('register', { pagetitle: 'Admin Registration', error: "Registration has been disabled" })
	}

	bcrypt.hash(password, 10, function (err, hash) {
		newAdmin.password = hash,
			Admin.create(newAdmin).then(function (adm) {
				return response.redirect('/admin/login')
			}).catch(err => {
				console.log(err)
				response.render('register', { pagetitle: 'Admin Registration', error: "Something went wrong!" })
			}
			)

	})

});

const getSettings = async () => {
	try {
		let settings = await Settings.findOne()
		if (!settings) {
			settings = await Settings.create({})
			// console.log('un', settings)
			settings = settings.toObject()
			// delete settings.adminRegistration
			// delete settings.charge
			delete settings.__v
			return settings
		}
		else {

			settings = settings.toObject()
			delete settings.__v
			// delete settings.adminRegistration
			// delete settings.charge
			// console.log(settings)
			return settings
		}
	}
	catch (error) {
		console.log(error)
	}
}

module.exports = router