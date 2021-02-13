const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Appointment = require('../../../models/both/Appointment')
const Doctor = require('../../../models/odoctor/Doctor')
const Settings = require('../../../models/both/Settings')

// fireabse admin
const admin2 = require('../../both/firebase-admin').admin2

router.post('/', [
	body('userID').notEmpty().withMessage('UserID is required'),
	body('doctorID').notEmpty().withMessage('doctorID is required'),
	body('type').notEmpty().withMessage('type is required').bail().isString().withMessage('type is not valid').bail().isIn(['Chat', 'Audio', 'Video']),
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('currentToken').notEmpty().withMessage('token is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, username, } = request.body
	let endTime
	User.findOne({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' }, currentToken }, function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}

		let { userID, doctorID, type, timestamp } = request.body
		if (!timestamp) {
			timestamp = new Date()
		}
		let newAppointment = {
			userID, doctorID, type, timestamp
		}

		Doctor.findOne({ _id: doctorID }, function (err, doctor) {
			if (!doctor) {
				//Invalid credential
				return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			}
			if ((!doctor.verified) || (!doctor.fcm_token)) {
				return response.status(400).json({ error: "Doctor cannot be reached at this time, please try again" })
			}
			// timestamp = timestamp || new Date()
			Appointment.find({ userID, doctorID }, async function (err, appointments) {
				if (appointments.length > 0) {

					for (let i in appointments) {
						if ((appointments[i].status == "Ongoing") && (appointments[i].type == type)) {
							return response.send({ error: `You already have an ongoing ${type} chat with this doctor` })
						}
					}

				}

				if (type == "Audio") {
					let settingg = await getSettings()
					let audioPrice = settingg.audioPrice
					console.log(audioPrice)
					if (user.wallet < audioPrice) {
						return response.status(400).json({ error: "You don't have succifient credit, Please fund your account." })
					}

					endTime = Math.floor(user.wallet / audioPrice)
					newAppointment.endTime = endTime
				}

				else if (type == "Video") {
					let settingg = await getSettings()
					let videoPrice = settingg.videoPrice
					if (user.wallet < videoPrice) {
						return response.status(400).json({ error: "You don't have succifient credit, Please fund your account." })
					}

					endTime = Math.floor(user.wallet / videoPrice)
					newAppointment.endTime = endTime
				}
				else if (type == 'Chat') {
					newAppointment.status = 'Ongoing'
				}

				// newAppointment.endTime = 1

				Appointment.create(newAppointment).then(async function (appointment1) {

					let appointment = appointment1.toObject()
					delete appointment.__v
					appointment.doctorName = doctor.name
					appointment.doctorPhoto = doctor.photo
					//////////////
					let title, body
					if (type == "Chat") {
						title = `New Chat request from ${user.name}`
						body = `You have one new chat request from ${user.name}`
					}
					else if (type == "Video") {
						title = `New Video call request from ${user.name}`
						body = `You have a video call request from ${user.name}`
					}
					else if (type == "Audio") {
						title = `New Audio call request from ${user.name}`
						body = `You have an audio call request from ${user.name}`
					}
					let msg = {}

					if (type == "Chat") {
						msg = {
							token: doctor.fcm_token,
							android: {
								notification: {
									title: title,
									body: body,
									channelId: '500',
									icon: 'ic_launcher_round',
									sound: 'default'
								},
								priority: 'high'
							},
							'data': {
								appointmentID: String(appointment._id),
								name: String(user.name),
								type: String(type),
								// chatAccept: (type == "Chat") ? 'true' : 'false'
								chatAccept: 'false'
							}
						}
					}
					else {
						msg = {
							token: doctor.fcm_token,
							android: {
								// notification: {
								// 	// title: title,
								// 	// body: body,
								// 	channelId: '500'
								// },
								priority: 'high'
							},
							'data': {
								appointmentID: String(appointment._id),
								name: String(user.name),
								type: String(type),
								photo: String(user.photo)
							}
						}
					}
					sendPushNotification(msg)
					// let du = await Doctor.updateOne({ _id: doctorID }, { acceptAudio: false, acceptVideo: false })
					///////////

					return response.send({ appointment, success: true, endTime })
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
			delete settings.charge
			delete settings.__v
			return settings
		}
		else {

			settings = settings.toObject()
			delete settings.__v
			delete settings.adminRegistration
			delete settings.charge
			// console.log(settings)
			return settings
		}
	}
	catch (error) {
		console.log(error)
	}
}

module.exports = router
