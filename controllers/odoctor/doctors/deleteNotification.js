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
	body('notificationID').notEmpty().withMessage('notificationID is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, doctorID, notificationID } = request.body
	Doctor.findOne({ _id: doctorID, currentToken }, async function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}
		let notification = await deleteNotification(notificationID)
		if (!notification) {
			return response.status(400).json({ error: "Opps!, notification does not exist" })
		}

		return response.send({ success: true })

	}).catch(next)

})

const deleteNotification = async (_id) => {
	try {
		let notification = await NotificationD.findOneAndDelete({ _id }, { seen: true })
		if (!notification) {
			return false
		}
		else {

			notification = notification.toObject()
			delete notification.__v
			return notification
		}
	}
	catch (error) {
		console.log(error)
	}
}


module.exports = router