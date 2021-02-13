const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')

router.get('/:id', async function (req, res) {

	if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {

		const currentToken = req.signedCookies.currentToken
		const adminEmail = req.signedCookies.adminEmail
		try {
			var decoded = jwt.verify(currentToken, privateKey);
			// console.log(decoded)

			let adminEx = await adminExist(decoded.email)

			if ((decoded.email == adminEmail) && adminEx) {
				if (adminEx && adminEx > 1) {
					const admin = await getAdmin(String(req.params.id))
					if (!admin) {
						return res.redirect('/admin/dashboard')
					}

					// console.log(admin)
					return res.render('admin', { pagetitle: 'oHealth - Manage Admin', admin, adminPriviledge: adminEx });
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
					const admin = await getAdmin(String(req.params.id))
					if (!admin) {
						return res.redirect('/admin/dashboard')
					}
					let updateV = await updateAdmin(String(req.params.id), admin.verified)
					return res.redirect('/admin/admin/' + String(req.params.id))
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
					const admin = await getAdmin(String(req.params.id))
					if (!admin) {
						return res.redirect('/admin/dashboard')
					}
					// console.log(admin)
					let del = await Admin.deleteOne({ _id: req.params.id })
					return res.redirect('/admin/manageAdmins')
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


const getAdmin = async (id) => {
	try {
		let admin = await Admin.findOne({ _id: id })
		if (!admin) {

			return false
		}
		else {
			admin = admin.toObject()
			delete admin.password
			delete admin.__v
			delete admin.currentToken
			return admin
		}
	}
	catch (error) {
		console.log(error)
	}
}

const updateAdmin = async (id, verified) => {
	try {
		// console.log(verified)
		let admin = await Admin.findOneAndUpdate({ _id: id }, { verified: !verified }, { new: true })
		if (!admin) {

			return false
		}
		else {
			admin = admin.toObject()
			delete admin.password
			delete admin.__v
			delete admin.currentToken
			return admin
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
