const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const Doctor = require('../../../models/odoctor/Doctor')
const User = require('../../../models/ohealth/User')
const Notification = require('../../../models/ohealth/Notification')
const EMR = require('../../../models/both/EMR')


// fireabse admin
const admin1 = require('../../both/firebase-admin').admin1


router.post('/', [
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('complains').isString(),
	body('assessment').isString(),
	body('prescriptions').isString(),
	body('treatment_plan').isString(),
	body('prescription_expiry'),
	body('userID').notEmpty().withMessage('userID is required'),

], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, mdcnNumber, assessment, prescriptions, treatment_plan, userID, prescription_expiry, complains } = request.body
	Doctor.findOne({ mdcnNumber, currentToken }, async function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "AUTH" })
		}

		if (assessment || prescriptions || complains || treatment_plan) {


			let details = {
				userID,
				doctorID: doctor._id,
				doctorsNote: { complains, assessment, doctorID: doctor._id },
				treatmentPlan: { treatment_plan, doctorID: doctor._id },
				prescriptions: { prescriptions, expiry: prescription_expiry, doctorID: doctor._id }
			}

			let theUser = await getUser(userID)

			if (!theUser) {
				return response.status(400).json({ error: "Error while saving" })
			}


			EMR.create(details)
				.then(async function (emr) {

					if (prescriptions || treatment_plan) {
						let notification = {
							userID,
							title: `New Prescription & Treatment Plan from Dr. ${doctor.name}`,
							message: `***********Prescriptions***********
${prescriptions}
Expiry: ${prescription_expiry} 

***********Treatment Plan***********
${treatment_plan}
`

						}
						let newNotification = await createNotification(notification)

						if (newNotification) {
							////////////
							const msg = {
								token: theUser.fcm_token,
								android: {
									notification: {
										title: `Dr. ${doctor.name} sent you  Prescription & Treatment Plan`,
										body: `Dr. ${doctor.name} have sent you new Prescription and Treatment Plan`,
										channelId: '500',
										icon: 'ic_launcher',
										sound: 'default'
									},
									priority: 'high'
								},
								data: {
									notificationID: String(newNotification._id),
									type: "Notification"
								}
							}
							if (theUser.fcm_token) {
								sendPushNotification(msg)
							}
							/////////
						}
					}
					return response.send({ success: true })


				}).catch(next)
		}

		else {
			return response.send({ success: true })
		}
	}).catch(next)

})


async function getUser(_id) {
	try {
		let user = await User.findOne({ _id })
		if (user) {
			return user
		}
		else {
			return false
		}
	}
	catch (e) {
		console.log(e)
	}
}

async function createNotification(notification) {
	try {
		let notif = await Notification.create(notification)
		if (notif) {
			return notif
		}
		else {
			return false
		}
	}
	catch (e) {
		console.log(e)
	}
}

function sendPushNotification(msg) {
	admin1.messaging().send(msg)
		.then((response) => {
			console.log("Message sent successfully", response)
		})
		.catch((error) => {
			console.log("Error sending message", error)
		})
}

module.exports = router