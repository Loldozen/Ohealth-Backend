const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')
var Doctor = require('../../models/odoctor/Doctor')
var Appointment = require('../../models/both/Appointment')
const Laboratory=require('../../models/Lab/Laboratory')

router.get('/:id', async function (req, res) {

	if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {

		const currentToken = req.signedCookies.currentToken
		const adminEmail = req.signedCookies.adminEmail
		try {
			var decoded = jwt.verify(currentToken, privateKey);
			// console.log(decoded)

			let adminEx = await adminExist(decoded.email)

			if ((decoded.email == adminEmail) && adminEx) {
				const lab = await getLab(String(req.params.id))
				if (!lab) {
					return res.redirect('/admin/dashboard')
				}
			
				return res.render('laboratory', { pagetitle: 'oHealth - Manage Laboratory', laboratory});
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
					const doctor = await getLab(String(req.params.id))
					if (!lab) {
						return res.redirect('/admin/dashboard')
					}
					let updateV = await updateLab(String(req.params.id), lab.verified)
					return res.redirect('/admin/laboratory/' + String(req.params.id))
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
					const lab = await getLab(String(req.params.id))
					if (!lab) {
						return res.redirect('/admin/dashboard')
					}
					// console.log(doctor)
					let del = await Laboratory.deleteOne({ _id: req.params.id })
					return res.redirect('/admin/manageLabs')
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


const getLab = async (id) => {
	try {
		let lab = await Laboratory.findOne({ _id: id })
		if (!lab) {

			return false
		}
		else {
			lab = lab.toObject()
			delete lab.password
			delete lab.__v
			delete lab.currentToken
			return lab
		}
	}
	catch (error) {
		console.log(error)
	}
}

const updateLab = async (id, verified) => {
	try {
		// console.log(verified)
		let lab = await Laboratory.findOneAndUpdate({ _id: id }, { verified: !verified }, { new: true })
		if (!lab) {

			return false
		}
		else {
			lab = lab.toObject()
			delete lab.password
			delete lab.__v
			delete lab.currentToken
			return lab
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

const updateAdminLog = async (email, name, action) => {
	try {
		let admin = await Admin.findOne({ email })
		if (!admin) {

			return false
		}
		else {
			let log = admin.log
			log = log + "\n" + `${formatDate(new Date())}: ${admin.name} ${action} Dr. ${name}`
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
