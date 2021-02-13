const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Notification = require('../../../models/ohealth/Notification')

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
		let notifications = await getNotifications(userID)


		return response.send({ notifications, success: true })

	}).catch(next)

})

const getNotifications = async (userID) => {
	try {
		let notifications = await Notification.find({ userID }, null, { limit: 30, sort: { '_id': 'descending' } })
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