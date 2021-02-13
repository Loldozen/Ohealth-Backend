const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const Doctor = require('../../../models/odoctor/Doctor')
const NotificationD = require('../../../models/odoctor/NotificationD')

router.post('/', [
	body('doctorID').notEmpty().withMessage('doctorID is required'),
	body('currentToken').notEmpty().withMessage('token is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, doctorID } = request.body
	Doctor.findOne({ _id: doctorID, currentToken }, async function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}
		let notifications = await getNotifications(doctorID)


		return response.send({ notifications, success: true })

	}).catch(next)

})

const getNotifications = async (doctorID) => {
	try {
		let notifications = await NotificationD.find({ doctorID }, null, { limit: 30, sort: { '_id': 'descending' } })
		if (!notifications) {
			return []
		}
		else {
			return notifications
		}
	}
	catch (error) {
		console.log(error)
	}
}


module.exports = router