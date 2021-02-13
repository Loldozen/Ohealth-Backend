const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')

router.get('/', async function (req, res) {

	if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {

		const currentToken = req.signedCookies.currentToken
		const adminEmail = req.signedCookies.adminEmail
		try {
			var decoded = jwt.verify(currentToken, privateKey);
			// console.log(decoded)

			let adminEx = await adminExist(decoded.email)

			if ((decoded.email == adminEmail) && adminEx) {
				if (adminEx && adminEx > 1) {
					const admins = await getAdmins()
					return res.render('admins', { pagetitle: 'oHealth - Admins List', admins, adminPriviledge: adminEx });
				}
				else {
					return res.redirect('/admin/dashboard')
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


const getAdmins = async () => {
	try {
		let admins = await Admin.find()
		if (!admins) {

			return []
		}
		else {
			let newAdmins = []
			for (let i in admins) {
				delete admins[i].password
				delete admins[i].__v
				delete admins[i].currentToken
				newAdmins.push(admins[i])
			}
			// console.log(newAdmins)
			return newAdmins
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
