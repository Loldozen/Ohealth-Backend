const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const Doctor = require('../../../models/odoctor/Doctor')
const User = require('../../../models/ohealth/User')
const EMR = require('../../../models/both/EMR')

router.post('/', [
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('userID').notEmpty().withMessage('user ID is required').bail().isString().withMessage('user ID is not valid').bail().isLength({ min: 5, max: 40 }).withMessage('user ID can only be between 5 and 40 chars'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, mdcnNumber, userID } = request.body
	Doctor.findOne({ mdcnNumber, currentToken }, function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}


		User.findOne({ _id: userID }, function (err, user) {
			if (!user) {
				//Invalid credential
				return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			}
			EMR.findOne({ userID }, null, { sort: { _id: -1 } }, function (err, emr) {
				if (!emr) {
					return response.send({ success: true })
				}
				emr = emr.toObject()

				if ((emr.doctorsNote) && (emr.doctorsNote.doctorID)) {
					Doctor.findOne({ _id: emr.doctorsNote.doctorID }, function (err, doc) {
						if (doc) {

							emr.doctor = { name: doc.name, specialization: doc.specialization }
						}

						return response.send({ emr, success: true })
					}).catch(next)
				}
				else {
					return response.send({ emr, success: true })
				}

			}).catch(next)
		}).catch(next)









	}).catch(next)

})

module.exports = router