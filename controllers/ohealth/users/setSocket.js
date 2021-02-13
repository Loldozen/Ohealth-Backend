const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')

router.post('/', [
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('socketID').notEmpty().withMessage('socketID is required').bail().isString('socketID is Invalid'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, username, } = request.body
	User.findOne({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' }, currentToken }, function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "AUTH" })
		}

		let { socketID, fcm_token } = request.body
		// socketID = JSON.stringify(socketID)
		let updateDoc = {
			socketID,
			online: true,
			last_login: (new Date()).getTime()
		}
		if (fcm_token) {
			updateDoc.fcm_token = fcm_token
		}

		User.findOneAndUpdate({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' } }, updateDoc, { new: true })
			.then(function (user) {
				console.log('set')
				let newUser = user.toObject()
				delete newUser.password
				delete newUser.__v
				delete newUser.fcm_token
				delete newUser.last_login
				delete newUser.socketID
				return response.send({ success: true, user: newUser })
			}).catch(next)

	}).catch(next)

})

module.exports = router
