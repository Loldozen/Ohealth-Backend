const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Appointment = require('../../../models/both/Appointment')
const Doctor = require('../../../models/odoctor/Doctor')
const Chat = require('../../../models/both/Chat')

// fireabse admin
const admin2 = require('../../both/firebase-admin').admin2

router.post('/', [
	body('doctorID').notEmpty().withMessage('doctorID is required'),
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('currentToken').notEmpty().withMessage('token is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, username, doctorID, } = request.body
	let endTime
	User.findOne({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' }, currentToken }, function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}



		let newAppointment = {
			userID: user._id, doctorID, type: 'Chat'
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
			Appointment.find({ userID: user._id, doctorID, type: 'Chat' }, async function (err, appointments) {

				let chat
				if (appointments.length > 0) {

					for (let i in appointments) {
						if ((appointments[i].status == "Ongoing") || (appointments[i].status == "Waiting")) {

							let newChat = {
								userID: user._id, doctorID, sender: 'System', message: `${user.name} booked an appointment`, appointmentID: appointments[i]._id
							}

							chat = await sendMessage(newChat)

							//////////////
							let title, body

							title = `New Appointment booking from ${user.name}`
							body = `Please let ${user.name} know when you will be available by texting them now`

							let msg = {
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
								data: {
									appointmentID: String(appointments[i]._id),
									name: user.name,
									type: 'Chat',
									// chatAccept: (type == "Chat") ? 'true' : 'false'
								}
							}

							sendPushNotification(msg)

							///////////

							return response.send({ success: true })
							break
						}
					}

				}

				// newAppointment.status = 'Ongoing'

				// newAppointment.endTime = 1

				Appointment.create(newAppointment).then(async function (appointment) {

					// let appointment = appointment1.toObject()
					// delete appointment.__v
					// appointment.doctorName = doctor.name
					// appointment.doctorPhoto = doctor.photo

					let newChat = {
						userID: user._id, doctorID, sender: 'System', message: `${user.name} booked an appointment`, appointmentID: appointment._id
					}

					chat = await sendMessage(newChat)
					//////////////
					let title, body

					title = `New Appointment booking from ${user.name}`
					body = `Please let ${user.name} know when you will be available by texting them now`

					let msg = {
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
						data: {
							appointmentID: String(appointment._id),
							name: user.name,
							type: 'Chat',
							// chatAccept: (type == "Chat") ? 'true' : 'false'
						}
					}

					sendPushNotification(msg)

					///////////

					return response.send({ success: true })
				}).catch(next)


			}).catch(next)

		}).catch(next)


	}).catch(next)

})

const sendMessage = async chatObject => {
	try {
		let chat = await Chat.create(newChat)
		return chat
	}
	catch (e) {
		console.log(e)
	}
}

function sendPushNotification(msg) {
	admin2.messaging().send(msg)
		.then((response) => {
			// console.log("Message sent successfully", response)
		})
		.catch((error) => {
			console.log("Error sending message", error)
		})
}

module.exports = router
