const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Doctor = require('../../../models/odoctor/Doctor')
// const Appointment = require('../../../models/both/Appointment')
const Chat = require('../../../models/both/Chat')
const Settings = require('../../../models/both/Settings')

//fireabse admin
const admin2 = require('../../both/firebase-admin').admin2

//Cloudinary media upload
const cloudinary = require('cloudinary').v2
cloudinary.config({
	cloud_name: 'ohealthng-com',
	api_key: '838578422156265',
	api_secret: 'eFWW8fjOiFPSDZPyetybhzd9dv0'
});


router.post('/', [
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('appointmentID').notEmpty().withMessage('appointment ID is required').bail().isString().withMessage('appointment ID is not valid').bail().isLength({ min: 5, max: 40 }).withMessage('appointment ID can only be between 5 and 40 chars'),
	body('doctorID').notEmpty().withMessage('Doctor ID is required').bail().isString().withMessage('Doctor ID is not valid').bail().isLength({ min: 5, max: 40 }).withMessage('Doctor ID can only be between 5 and 40 chars'),
	body('userID').notEmpty().withMessage('user ID is required').bail().isString().withMessage('user ID is not valid').bail().isLength({ min: 5, max: 40 }).withMessage('user ID can only be between 5 and 40 chars'),
	body('message').notEmpty().withMessage('message is required').bail().isString().withMessage('message is not valid'),
	body('sender').notEmpty().withMessage('sender is required'),
	body('media'),

], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, username, } = request.body
	User.findOne({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' }, currentToken }, async function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}


		let { userID, doctorID, sender, message, appointmentID, media } = request.body





		let settingss = await getSettings()
		// console.log(chatPrice)
		let chatPrice = settingss.chatPrice
		if (sender == "User") {

			if (!chatPrice) {
				return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			}
			// console.log(chatPrice)
			if (user.wallet < chatPrice) {
				return response.status(400).json({ error: "You don't have succifient credit to send, Please fund your account." })
			}
			let chargeU = await User.findOneAndUpdate({ username }, { wallet: (user.wallet - chatPrice).toFixed(2) })
			// console.log(chargeU)
		}

		let newChat = {
			userID, doctorID, sender, message, appointmentID
		}
		if (media) {
			let img_url = await uploadToCloudinary(message, user._id, doctorID)

			if (!img_url) {
				return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			}

			newChat.message = img_url
			newChat.media = media
		}


		// console.log(chargeU)
		Chat.create(newChat).then(function (chat) {
			// return response.send({ chat, success: true })
			Chat.find({ appointmentID }, function (err, chats) {
				if (!chats) {
					// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
					return response.send({ error: true })
				}

				Doctor.findOne({ _id: doctorID }, async function (err, doctor) {
					if (!doctor) {
						//Invalid credential
						// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
					}
					let charge = settingss.charge
					let docS = 100 - charge
					docS = (docS / 100) * chatPrice
					let setS = (charge / 100) * chatPrice
					let chargeD = await Doctor.findOneAndUpdate({ _id: doctorID }, { wallet: (doctor.wallet + docS).toFixed(2) })
					let today = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear()
					let adminDailyShare = settingss.adminDailyShare

					if (adminDailyShare.date == today) {
						adminDailyShare.amount = (Number(adminDailyShare.amount) + setS).toFixed(2)
					}
					else {
						adminDailyShare = { date: today, amount: setS.toFixed(2) }
					}
					let setti = await Settings.updateMany({}, { adminShare: (settingss.adminShare + setS).toFixed(2), adminDailyShare })
					// console.log(chargeD)
					//////////////

					let notificationTitle, notificationMessage
					if (media) {
						notificationTitle = `${user.name} send a media`
						notificationMessage = `You received a media file from ${user.name}`
					}
					else {
						notificationTitle = `New message from ${user.name}`
						notificationMessage = message.substring(0, 10) + '...'
					}
					const msg = {
						token: doctor.fcm_token,
						android: {
							notification: {
								title: notificationTitle,
								body: notificationMessage,
								channelId: '500',
								icon: 'ic_launcher',
								sound: 'default'
							},
							priority: 'high'
						},
						data: {
							appointmentID,
							name: user.name,
							type: "Chat"
						}
					}
					sendPushNotification(msg)
					///////////

					// console.log(appointments)
					return response.send({ success: true, chats })

				}).catch(next)
			}).catch(next)


		}).catch(next)


	}).catch(next)

})

function sendPushNotification(msg) {
	admin2.messaging().send(msg)
		.then((response) => {
			// console.log("Message sent successfully", response)
		})
		.catch((error) => {
			console.log("Error sending message", error)
		})
}

const getSettings = async () => {
	try {
		let settings = await Settings.findOne()
		if (!settings) {
			settings = await Settings.create({})
			// console.log('un', settings)
			settings = settings.toObject()
			delete settings.adminRegistration
			// delete settings.charge
			delete settings.__v
			return settings
		}
		else {

			settings = settings.toObject()
			delete settings.__v
			delete settings.adminRegistration
			// delete settings.charge
			// console.log(settings)
			return settings
		}
	}
	catch (error) {
		console.log(error)
	}
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
