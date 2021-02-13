const express = require('express')
const router = express.Router()

const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const bcrypt = require('bcrypt')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')
var Settings = require('../../models/both/Settings')
var User = require('../../models/ohealth/User')
var Doctor = require('../../models/odoctor/Doctor')

router.get('/', async function (req, res) {

	if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {

		const currentToken = req.signedCookies.currentToken
		const adminEmail = req.signedCookies.adminEmail
		try {
			var decoded = jwt.verify(currentToken, privateKey);
			// console.log(decoded)

			let adminEx = await adminExist(decoded.email)

			if ((decoded.email == adminEmail) && adminEx) {
				const settings = await getSettings()
				let onlineUsers = await User.find({ online: true }, "_id")
				let onlineDoctors = await Doctor.find({ online: true }, "_id")
				onlineUsers = onlineUsers ? onlineUsers.length : 0
				onlineDoctors = onlineDoctors ? onlineDoctors.length : 0


				return res.render('prices', { pagetitle: 'oHealth - Manage Prices', settings, adminPriviledge: adminEx, onlineUsers, onlineDoctors });
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

//update
router.post('/', [
	body('chatPrice').notEmpty().withMessage('chatPrice is required').bail().isNumeric().withMessage('chatPrice is not valid'),
	body('audioPrice').notEmpty().withMessage('audioPrice is required').bail().isNumeric().withMessage('audioPrice is not valid'),
	body('videoPrice').notEmpty().withMessage('videoPrice is required').bail().isNumeric().withMessage('videoPrice is not valid'),
	body('charge').notEmpty().withMessage('charge is required').bail().isNumeric().withMessage('charge is not valid'),
],
	async function (req, res, next) {

		if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.redirect('/admin/managePrices')
			}

			let { charge, chatPrice, audioPrice, videoPrice } = req.body
			const currentToken = req.signedCookies.currentToken
			const adminEmail = req.signedCookies.adminEmail
			try {
				var decoded = jwt.verify(currentToken, privateKey);
				// console.log(decoded)

				let adminEx = await adminExist(decoded.email)

				//If super admin
				if (adminEx && adminEx > 1) {
					if ((decoded.email == adminEmail) && adminEx) {
						let upd = await Settings.updateMany({}, { charge, chatPrice, audioPrice, videoPrice })
						const settings = await getSettings()
						let adminLog = await updateAdminLog(decoded.email)
						return res.render('prices', { pagetitle: 'oHealth - Manage Prices', settings, adminPriviledge: adminEx, });
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



const getSettings = async () => {
	try {
		let settings = await Settings.findOne()
		if (!settings) {
			settings = await Settings.create({})
			// console.log('un', settings)
			return settings
		}
		else {

			settings = settings.toObject()
			delete settings.__v
			// console.log(settings)
			return settings
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

const updateAdminLog = async email => {
	try {
		let admin = await Admin.findOne({ email })
		if (!admin) {

			return false
		}
		else {
			let log = admin.log
			log = log + "\n" + `${formatDate(new Date())}: ${admin.name} viewed prices list`
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
