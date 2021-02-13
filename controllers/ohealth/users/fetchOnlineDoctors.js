const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
const Doctor = require('../../../models/odoctor/Doctor')
const User = require('../../../models/ohealth/User')


router.post('/', [
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('specialist')
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}


	const { specialist, username, currentToken } = request.body

	const tim = (((new Date()).getTime()) - (1000 * 60 * 10))
	// let finder = { last_login: { $gt: tim } }
	let finder = { $and: [{ verified: true }, { $or: [{ available: true }, { available: null }] }] }
	if (specialist) {
		// finder.specialist = specialist
<<<<<<< HEAD
		finder = { $and: [{ verified: true }, { $or: [{ available: true }, { available: null }] }, { $or: [{ specialization: { $regex: specialist, $options: 'i' } }, { name: { $regex: specialist, $options: 'i' } }] }] }
=======
		finder = { $and: [{ verified: true }, { $or: [{ available: true }, { available: null }] }, { $or: [{ specialization: { $regex: '^' + specialist + '$', $options: 'i' } }, { name: { $regex: specialist, $options: 'i' } }] }] }
>>>>>>> 14af74daf7eacb7d2e09e995ff242bbafbfb86ca
	}


	User.findOne({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' }, currentToken }, function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}
		Doctor.find(finder, null, { limit: 40, sort: { 'last_login': 'descending' } }, function (err, doctors) {
			// return response.send({ success: true, doctors: doctors && doctors.length })
			if (!doctors || doctors.length < 1) {
				// console.log(doctors)
				// //Invalid credential
				// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
				return response.send({ success: true, doctors: [] })
			}
			// console.log(doctors)

			let newDoctors = []
			let dc = {}
			for (let i in doctors) {
				dc = doctors[i].toObject()
				// // console.log(dc)
				// delete dc.password
				// delete dc.__v
				// delete dc.currentToken
				// delete dc.wallet
				// delete dc.socketID
				// delete dc.phoneNumber
				// delete dc.DOB

				// // delete dc.acceptAudio
				// // delete dc.acceptVideo
				// delete dc.fcm_token
				// delete dc.verified
				dc = {
					name: dc.name,
					_id: dc._id,
					acceptAudio: dc.acceptAudio,
					acceptVideo: dc.acceptVideo,
					photo: dc.photo,
					last_login: dc.last_login,
					online: dc.online,
					specialization: dc.specialization,
					languages: dc.languages
				}
				newDoctors.push(dc)
			}
			return response.send({ doctors: newDoctors, success: true })

		}).catch(next)
	}).catch(next)

})

module.exports = router
