const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')
var User = require('../../models/ohealth/User')
var Appointment = require('../../models/both/Appointment')

router.get('/:id', async function (req, res) {

	if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {

		const currentToken = req.signedCookies.currentToken
		const adminEmail = req.signedCookies.adminEmail
		try {
			var decoded = jwt.verify(currentToken, privateKey);
			// console.log(decoded)

			let adminEx = await adminExist(decoded.email)

			if ((decoded.email == adminEmail) && adminEx) {
				const user = await getUser(String(req.params.id))
				if (!user) {
					return res.redirect('/admin/dashboard')
				}
				const appointment = {
					messages: await Appointment.countDocuments({ userID: String(req.params.id), type: 'Chat' }),
					video: await Appointment.countDocuments({ userID: String(req.params.id), type: 'Video' }),
					audio: await Appointment.countDocuments({ userID: String(req.params.id), type: 'Audio' }),
				}
				// console.log(user)
				let adminLog = await updateAdminLog(decoded.email, user.username, 'viewed')
				return res.render('user', { pagetitle: 'oHealth - Manage User', user, appointment, adminPriviledge: adminEx });
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

router.get('/verify/:id', async function (req, res) {

	if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {

		const currentToken = req.signedCookies.currentToken
		const adminEmail = req.signedCookies.adminEmail
		try {
			var decoded = jwt.verify(currentToken, privateKey);
			// console.log(decoded)

			let adminEx = await adminExist(decoded.email)

			//If super admin
			if (adminEx && adminEx > 1) {
				if ((decoded.email == adminEmail) && adminEx) {
					const user = await getUser(String(req.params.id))
					if (!user) {
						return res.redirect('/admin/dashboard')
					}
					let adminLog = await updateAdminLog(decoded.email, user.username, 'changed verification status of')
					let updateV = await updateUser(String(req.params.id), user.verified)
					return res.redirect('/admin/user/' + String(req.params.id))
				}
				else {
					return res.redirect('/admin/login')
				}
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


router.get('/delete/:id', async function (req, res) {

	if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {

		const currentToken = req.signedCookies.currentToken
		const adminEmail = req.signedCookies.adminEmail
		try {
			var decoded = jwt.verify(currentToken, privateKey);
			// console.log(decoded)

			let adminEx = await adminExist(decoded.email)

			//If super admin
			if (adminEx && adminEx > 1) {
				if ((decoded.email == adminEmail) && adminEx) {
					const user = await getUser(String(req.params.id))
					if (!user) {
						return res.redirect('/admin/dashboard')
					}
					// console.log(user)
					let adminLog = await updateAdminLog(decoded.email, user.username, 'deleted')
					let del = await User.deleteOne({ _id: req.params.id })
					return res.redirect('/admin/manageUsers')
				}
				else {
					return res.redirect('/admin/login')
				}
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


const getUser = async (id) => {
	try {
		let user = await User.findOne({ _id: id })
		if (!user) {

			return false
		}
		else {
			user = user.toObject()
			delete user.password
			delete user.__v
			delete user.currentToken
			return user
		}
	}
	catch (error) {
		console.log(error)
	}
}

const updateUser = async (id, verified) => {
	try {
		// console.log(verified)
		let user = await User.findOneAndUpdate({ _id: id }, { verified: !verified }, { new: true })
		if (!user) {

			return false
		}
		else {
			user = user.toObject()
			delete user.password
			delete user.__v
			delete user.currentToken
			return user
		}
	}
	catch (error) {
		console.log(error)
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

const updateAdminLog = async (email, username, action) => {
	try {
		let admin = await Admin.findOne({ email })
		if (!admin) {

			return false
		}
		else {
			let log = admin.log
			log = log + "\n" + `${formatDate(new Date())}: ${admin.name} ${action} user ${username}`
			let up = await Admin.findOneAndUpdate({ email }, { log })
		}
	}
	catch (error) {
		console.log(error)
		return false
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


module.exports = router
