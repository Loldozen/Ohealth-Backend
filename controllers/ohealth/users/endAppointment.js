const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Doctor = require('../../../models/odoctor/Doctor')
const Appointment = require('../../../models/both/Appointment')
const Settings = require('../../../models/both/Settings')
const Transaction = require('../../../models/odoctor/Transaction')

router.post('/', [
	body('userID').notEmpty().withMessage('UserID is required'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('appointmentID').notEmpty().withMessage('appointment ID is required').bail().isString().withMessage('appointment ID is not valid').bail().isLength({ min: 5, max: 40 }).withMessage('appointment ID can only be between 5 and 40 chars'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, userID, appointmentID, endTime2 } = request.body
	let duration = ''
	User.findOne({ _id: userID, currentToken }, function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}





		Appointment.findOne({ _id: appointmentID, userID }, async function (err, appointment) {
			if (!appointment) {
				//Invalid request
				return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			}


			if ((appointment.type == "Audio") && (appointment.status == "Ongoing")) {
				let settingg = await getSettings()
				let audioPrice = settingg.audioPrice
				let endTime, endTimeA
				if (Number(endTime2) > 0) {
					endTimeA = appointment.endTime * 60
					endTime = endTimeA - endTime2
					endTime = Math.ceil(endTime / 60)
				}
				else {
					endTime = appointment.endTime
				}
				duration = (endTime > 1) ? `${endTime} mins` : `${endTime} min`
				diff = audioPrice * endTime
				let resp = await setWalletUser(diff, user.wallet, userID)
				let tran = { appointmentID, userID: appointment.userID, doctorID: appointment.doctorID, type: 'Credit', appointmentType: 'Audio', status: 'Completed' }
				let resp2 = await setWalletDoctor(diff, appointment.doctorID, tran)

			}

			else if ((appointment.type == "Video") && (appointment.status == "Ongoing")) {
				let settingg = await getSettings()
				let videoPrice = settingg.videoPrice
				let endTime, endTimeA
				if (Number(endTime2) > 0) {
					endTimeA = appointment.endTime * 60
					endTime = endTimeA - endTime2
					endTime = Math.ceil(endTime / 60)
				}
				else {
					endTime = appointment.endTime
				}
				duration = (endTime > 1) ? `${endTime} mins` : `${endTime} min`
				diff = videoPrice * endTime
				let resp = await setWalletUser(diff, user.wallet, userID)
				let tran = { appointmentID, userID: appointment.userID, doctorID: appointment.doctorID, type: 'Credit', appointmentType: 'Audio', status: 'Completed' }
				let resp2 = await setWalletDoctor(diff, appointment.doctorID, tran)

			}

			let updat = { status: 'Completed', }
			if (duration) {
				updat.duration = duration
			}

			Appointment.findOneAndUpdate({ _id: appointmentID }, updat, { new: true })
				.then(function (appointment) {
					if ((appointment.type == "Chat")) {
						Doctor.findOne({ _id: appointment.doctorID }, function (err, doctor) {
							if (!doctor) {
								//Invalid credential
								return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
							}

							let Nappointment = appointment.toObject()
							delete appointment.__v
							Nappointment.doctorName = doctor.name
							Nappointment.doctorPhoto = doctor.photo

							return response.send({ appointment: Nappointment, success: true })

						}).catch(next)
					}
					else {
						return response.send({ success: true })
					}
				}).catch(next)


		}).catch(next)


	}).catch(next)

})

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

const setWalletUser = async (diff, wallet, userID) => {
	try {
		let re = await User.findOneAndUpdate({ _id: userID }, { wallet: (wallet - diff).toFixed(2) }, { new: true })
	}
	catch (error) {
		console.log(error)
	}
}

const setWalletDoctor = async (diff, doctorID, tran) => {
	let sett = await getSettings()
	let charge = sett.charge
	let docS = 100 - charge
	docS = (docS / 100) * diff
	let setS = (charge / 100) * diff
	tran.amount = docS
	if (docS > 0) {
		let trans = await createTransaction(tran)
	}
	try {
		let doctor = await Doctor.findOne({ _id: doctorID })
		let re = await Doctor.findOneAndUpdate({ _id: doctorID }, { wallet: (doctor.wallet + docS).toFixed(2), acceptAudio: true, acceptVideo: true }, { new: true })
		let today = new Date().getDate() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear()
		let adminDailyShare = sett.adminDailyShare
		if (adminDailyShare.date == today) {
			adminDailyShare.amount = (Number(adminDailyShare.amount) + setS).toFixed(2)
		}
		else {
			adminDailyShare = { date: today, amount: setS.toFixed(2) }
		}
		let setti = await Settings.updateMany({}, { adminShare: (sett.adminShare + setS).toFixed(2), adminDailyShare })
	}
	catch (error) {
		console.log(error)
	}
}

const createTransaction = async tran => {
	try {
		let res = Transaction.create(tran)
	}
	catch (e) {
		console.log(e)
	}
}



module.exports = router
