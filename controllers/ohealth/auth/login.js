const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const privateKey = fs.readFileSync('./private.key')
const User = require('../../../models/ohealth/User')

router.post('/', [body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0)-9_]+$`).withMessage('Username contains invalid characters'), body('password').notEmpty().withMessage('Password is required').bail().isLength({ min: 5, max: 24 }).withMessage('Password should be of length between 5 and 24')], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { username, password } = request.body
	User.findOne({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' } }, function (err, user) {
		if (!user) {
			return response.status(400).json({ error: "User does not exist" })
		}

		bcrypt.compare(password, user.password, function (err, res) {
			if (res) {

				const sendUser = { username: user.username }
				if (user.verified) {
					const token = jwt.sign(sendUser, privateKey)
					User.findOneAndUpdate({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' } }, { currentToken: token }, { new: true })
						.then(function (user) {
							let { currentToken, name, username, email, _id } = user
							return response.send({ user: { currentToken, name, username, email, _id } })
						}).catch(next)

				}
				else {
					return response.status(400).json({ error: "User not verified yet!" })
				}
			}
			else {
				return response.status(400).json({ error: "Incorrect Password" })
			}
		})
	}).catch(next)
})

module.exports = router
