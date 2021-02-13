const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const privateKey = fs.readFileSync('./private.key')
const Doctor = require('../../../models/odoctor/Doctor')

router.post('/', [body('mdcnNumber').notEmpty().withMessage('mdcnNumber is required').bail().isString().withMessage('mdcnNumber is not valid').bail(), body('password').notEmpty().withMessage('Password is required').bail().isLength({ min: 5, max: 24 }).withMessage('Password should be of length between 5 and 24')], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { mdcnNumber, password } = request.body
	Doctor.findOne({ mdcnNumber }, function (err, doctor) {

		if (!doctor) {
			return response.status(400).json({ error: "Doctor does not exist" })
		}

		bcrypt.compare(password, doctor.password, function (err, res) {
			if (res) {
				let { _id, phoneNumber } = doctor
				// const sendDoctor = { mdcnNumber, _id, phoneNumber }

				if (doctor.verified) {

					const token = jwt.sign({ mdcnNumber }, privateKey)
					Doctor.findOneAndUpdate({ mdcnNumber }, { currentToken: token }, { new: true })
						.then(function (doc) {
							let doctor = doc.toObject()
							delete doctor.__v
							delete doctor.password
							let { currentToken, name, mdcnNumber, email, _id } = doctor
							return response.send({ doctor: { currentToken, name, mdcnNumber, email, _id } })

						}).catch(next)
				}
				else {
					return response.status(400).json({ error: "You are not verified yet!" })
				}

				// if (doctor.verified) {
				// 	const token = jwt.sign(doctor, privateKey)
				// 	Doctor.findOneAndUpdate({ mdcnNumber }, { currentToken: token }, { new: true })
				// 		.then(function (doctor) {
				// 			return response.send(doctor)
				// 		}).catch(next)

				// }
				// else {
				// 	return response.status(400).json({ error: "Doctor not verified yet!" })
				// }
			}
			else {
				return response.status(400).json({ error: "Incorrect Password" })
			}
		})
	}).catch(next)
})

module.exports = router