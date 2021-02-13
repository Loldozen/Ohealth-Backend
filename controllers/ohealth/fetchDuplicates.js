const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../models/ohealth/User')

router.get('/', [

], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}


	User.find({}, function (err, users) {
		if (!users) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}

		let seen = {}, all = []

		users.map((user, index) => {

			all.push(user.username)
		})

		for (let i = 0; i < all.length; i++) {
			if (!seen[all[i].toLowerCase()]) {
				seen[all[i].toLowerCase()] = 1
			}
			else {
				++seen[all[i].toLowerCase()]
			}
		}
		let them = []
		for (let x in seen) {
			if (seen[x] > 1) {
				them.push(x)
			}
		}

		return response.send(them)

	}).catch(next)

})

module.exports = router
