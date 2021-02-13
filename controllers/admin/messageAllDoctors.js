const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')
var Doctor = require('../../models/odoctor/Doctor')
const Notification = require('../../models/odoctor/NotificationD')
// fireabse admin
const admin2 = require('../both/firebase-admin').admin2



router.get('/', async function (req, res) {

	if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {

		const currentToken = req.signedCookies.currentToken
		const adminEmail = req.signedCookies.adminEmail
		try {
			var decoded = jwt.verify(currentToken, privateKey);
			// console.log(decoded)

			let adminEx = await adminExist(decoded.email)
			//If super admin

			if ((decoded.email == adminEmail) && adminEx) {
				if (adminEx && adminEx > 1) {
					return res.render('messageAllDoctors', { pagetitle: 'oHealth - Message all  Doctors', adminPriviledge: adminEx });
				}
			}
			else {
				return res.redirect('/admin/login')
			}

		} catch (err) {
			// err
			console.log(err)
			return res.redirect('/admin/login')
		}

	}
	else {
		return res.redirect('/admin/login')
	}
});


//message the doctor
router.post('/', [
	body('title').notEmpty().withMessage('Notification title is required').bail().isString().withMessage('title is not valid'),
	body('message').notEmpty().withMessage('message is required').bail().isString().withMessage('message is not valid'),
],
	async function (req, res, next) {

		if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.redirect('/admin/dashboard')
			}

			let { title, message } = req.body
			const currentToken = req.signedCookies.currentToken
			const adminEmail = req.signedCookies.adminEmail
			try {
				var decoded = jwt.verify(currentToken, privateKey);
				// console.log(decoded)

				let adminEx = await adminExist(decoded.email)


				if ((decoded.email == adminEmail) && adminEx) {
					//If super admin
					if (adminEx && adminEx > 1) {
						//does the doctor even exist?
						let doctors = await Doctor.find({}, '_id, fcm_token')
						if (!doctors || doctors.length < 1) {
							return res.render('messageAllDoctors', { pagetitle: 'oHealth - Message allDoctors', adminPriviledge: adminEx, error: 'Doctors does not exist' });
						}
						for (let doctor of doctors) {
							if (doctor.fcm_token) {
								await sendDoctorNotification(doctor, title, message)
							}
						}

						let adminLog = await updateAdminLog(decoded.email)
						return res.render('messageAllDoctors', { pagetitle: 'oHealth - Message all Doctors', adminPriviledge: adminEx, success: `Message successfully sent to all doctors` });
					}
				}
				else {
					return res.redirect('/admin/login')
				}

			} catch (err) {
				// err
				console.log(err)
				return res.redirect('/admin/login')
			}

		}
		else {
			return res.redirect('/admin/login')
		}
	});

const sendDoctorNotification = async (theDoctor, title, message) => {

	let notification = {
		doctorID: theDoctor._id,
		title,
		message
	}
	let newNotification = await createNotification(notification)

	if (newNotification) {
		////////////
		const msg = {
			token: theDoctor.fcm_token,
			android: {
				notification: {
					title,
					body: message.length > 30 ? message.substring(0, 30) : message,
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
		if (theDoctor.fcm_token) {
			sendPushNotification(msg)
		}
		/////////
	}

}

const updateAdminLog = async (email) => {
	try {
		let admin = await Admin.findOne({ email })
		if (!admin) {

			return false
		}
		else {
			let log = admin.log
			log = log + "\n" + `${formatDate(new Date())}: ${admin.name} messaged all doctors`
			let up = await Admin.findOneAndUpdate({ email }, { log })
		}
	}
	catch (error) {
		console.log(error)
		return false
	}
}

const adminExist = async (email) => {
	try {
		let admin = await Admin.findOne({ email })
		if (!admin) {

			return false
		}
		else {
			return admin.priviledge || 0
		}
	}
	catch (error) {
		console.log(error)
		return false
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
	admin2.messaging().send(msg)
		.then((response) => {
			console.log("Message sent successfully", response)
		})
		.catch((error) => {
			console.log("Error sending message", error)
		})
}
const formatDate = date => {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

module.exports = router
