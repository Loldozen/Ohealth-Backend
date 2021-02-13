const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../models/ohealth/User')

router.get('/', [

], async function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}
	let them = [

	]

	for (let i of them) {
		console.log(i)
		await editor(i)
	}

	return response.send('done')



})

const editor = async (username) => {
	try {
		let users = await User.find({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' } })
		// console.log(users)
		let min
		for (let user of users) {
			// console.log(user.wallet, user._id)
			if (min) {
				if (min.wallet <= user.wallet) {
					min = user
				}
			}
			else {
				min = user
			}

		}
<<<<<<< HEAD
		let chan = await User.findOneAndUpdate({ _id: min._id }, { username: min.username + '1' }, { new: true })
=======
		let chan = await User.findOneAndUpdate({ _id: min._id }, { username: min.username + '3' }, { new: true })
>>>>>>> 14af74daf7eacb7d2e09e995ff242bbafbfb86ca
		console.log(chan.username)
		return true
	}
	catch (e) {
		console.log(e)
	}
}

module.exports = router
