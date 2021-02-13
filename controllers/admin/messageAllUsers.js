const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')
var User = require('../../models/ohealth/User')
const Notification = require('../../models/ohealth/Notification')
// fireabse admin
const admin1 = require('../both/firebase-admin').admin1



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
					return res.render('messageAllUsers', { pagetitle: 'oHealth - Message all Users', adminPriviledge: adminEx });
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


//message the user
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
						//select all the users
						let users = await User.find({}, '_id, fcm_token')
						if (!users || users.length < 1) {
							return res.render('messageAllUsers', { pagetitle: 'oHealth - Message all Users', adminPriviledge: adminEx, error: 'Users does not exist' });
						}

						for (let user of users) {
							if (user.fcm_token) {
								await sendUserNotification(user, title, message)
							}
						}


						let adminLog = await updateAdminLog(decoded.email)
						return res.render('messageAllUsers', { pagetitle: 'oHealth - Message all Users', adminPriviledge: adminEx, success: `Message successfully sent to all users` });
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

const sendUserNotification = async (theUser, title, message) => {
	let notification = {
		userID: theUser._id,
		title,
		message
	}
	let newNotification = await createNotification(notification)

	if (newNotification) {
		////////////
		const msg = {
			token: theUser.fcm_token,
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
		if (theUser.fcm_token) {
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
			log = log + "\n" + `${formatDate(new Date())}: ${admin.name} messaged all users`
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
