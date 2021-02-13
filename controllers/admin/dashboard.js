const express = require('express')
const router = express.Router()

const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const bcrypt = require('bcrypt')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')
var Settings = require('../../models/both/Settings')
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
				const unverifiedDoctors = await getUnverifiedDoctors()
				const settings = await getSettings()
				return res.render('dashboard', { pagetitle: 'oHealth Admin Panel', unverifiedDoctors, settings, adminPriviledge: adminEx });
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


const getUnverifiedDoctors = async () => {
	try {
		let doctors = await Doctor.find({ verified: false })
		if (!doctors) {

			return []
		}
		else {
			let newDoctors = []
			for (let i in doctors) {
				delete doctors[i].password
				delete doctors[i].__v
				delete doctors[i].currentToken
				newDoctors.push(doctors[i])
			}
			// console.log(newDoctors)
			return newDoctors
		}
	}
	catch (error) {
		console.log(error)
	}
}

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


module.exports = router
