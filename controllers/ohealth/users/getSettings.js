const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Settings = require('../../../models/both/Settings')

router.post('/', [
	body('userID').notEmpty().withMessage('UserID is required'),
	body('currentToken').notEmpty().withMessage('token is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, userID } = request.body
	User.findOne({ _id: userID, currentToken }, async function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}
		let settings = await getSettings()


		return response.send({ settings, success: true })

	}).catch(next)

})

const getSettings = async () => {
	try {
		let settings = await Settings.findOne()
		if (!settings) {
			settings = await Settings.create({})
			// console.log('un', settings)
			settings = settings.toObject()
			delete settings.adminRegistration
			delete settings.charge
			delete settings.__v
			return settings
		}
		else {

			settings = settings.toObject()
			delete settings.__v
			delete settings.adminRegistration
			delete settings.charge
			// console.log(settings)
			return settings
		}
	}
	catch (error) {
		console.log(error)
	}
}


module.exports = router