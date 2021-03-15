const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Doctor = require('../../../models/odoctor/Doctor')
const Appointment = require('../../../models/both/Appointment')
const Chat = require('../../../models/both/Chat')

// fireabse admin
const admin1 = require('../../both/firebase-admin').admin1

//Cloudinary media upload
const cloudinary = require('cloudinary').v2
cloudinary.config({
	cloud_name: 'ohealthng-com',
	api_key: '838578422156265',
	api_secret: 'eFWW8fjOiFPSDZPyetybhzd9dv0'
});

router.post('/', [
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('appointmentID').notEmpty().withMessage('appointment ID is required').bail().isString().withMessage('appointment ID is not valid').bail().isLength({ min: 5, max: 40 }).withMessage('appointment ID can only be between 5 and 40 chars'),
	body('doctorID').notEmpty().withMessage('Doctor ID is required').bail().isString().withMessage('Doctor ID is not valid').bail().isLength({ min: 5, max: 40 }).withMessage('Doctor ID can only be between 5 and 40 chars'),
	body('userID').notEmpty().withMessage('user ID is required').bail().isString().withMessage('user ID is not valid').bail().isLength({ min: 5, max: 40 }).withMessage('user ID can only be between 5 and 40 chars'),
	body('message').notEmpty().withMessage('message is required').bail().isString().withMessage('message is not valid'),
	body('sender').notEmpty().withMessage('sender is required'),

], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, mdcnNumber, } = request.body
	Doctor.findOne({ mdcnNumber, currentToken }, async function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}


		let { userID, doctorID, sender, message, appointmentID, media } = request.body
		let newChat = {
			userID, doctorID, sender, message, appointmentID
		}
		if (media) {
			let img_url = await uploadToCloudinary(message, userID, doctorID)

			if (!img_url) {
				return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			}

			newChat.message = img_url
			newChat.media = media
		}

		Chat.create(newChat).then(function (chat) {
			// return response.send({ chat, success: true })
			Chat.find({ appointmentID }, function (err, chats) {
				if (!chats) {
					// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
					return response.send({ error: true })
				}


				User.findOne({ _id: userID }, function (err, user) {
					if (!user) {
						//Invalid credential
						return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
					}

					//////////////
					const msg = {
						token: user.fcm_token,
						android: {
							notification: {
								title: `New message from Dr. ${doctor.name}`,
								body: message.substring(0, 15) + '...',
								channelId: '500',
								icon: 'ic_launcher',
								sound: 'default'
							},
							priority: 'high'
						},
						data: {
							appointmentID,
							name: doctor.name,
							type: "Chat"
						}
					}
					if (user.fcm_token) {
						sendPushNotification(msg)
					}
					///////////


					// console.log(appointments)
					return response.send({ success: true, chats })

				}).catch(next)

			}).catch(next)


		}).catch(next)


	}).catch(next)

})

function sendPushNotification(msg) {
	admin1.messaging().send(msg)
		.then((response) => {
			console.log("Message sent successfully", response)
		})
		.catch((error) => {
			console.log("Error sending message", error)
		})
}

async function uploadToCloudinary(image, userID, doctorID) {
	try {

		let url = await cloudinary.uploader.upload(image, { folder: 'ohealth/chatMessages/' + userID + '__' + doctorID + '/' });
		return url.secure_url
	}
	catch (err) {
		console.log(err)
	}
}

module.exports = router
