const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')
var Doctor = require('../../models/odoctor/Doctor')
var Laboratory = require('../../models/Lab/Laboratory')

const { update } = require('../../models/admin/Admin')

router.get('/', async function (req, res) {

	if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {

		const currentToken = req.signedCookies.currentToken
		const adminEmail = req.signedCookies.adminEmail
		try {
			var decoded = jwt.verify(currentToken, privateKey);
			// console.log(decoded)

			let adminEx = await adminExist(decoded.email)

			if ((decoded.email == adminEmail) && adminEx) {
				const labs = await getLabs()
				let adminLog = await updateAdminLog(decoded.email)
				return res.render('laboratory', { pagetitle: 'oHealth - Laboratory List', labs, adminPriviledge: adminEx });
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


const getLabs = async () => {
	try {
		let lab = await Laboratory.find({}, null, { sort: { _id: -1 } })
		if (!lab) {

			return []
		}
		else {
			let newlab = []
			for (let i in lab) {
				delete lab[i].password
				delete lab[i].__v
				delete lab[i].currentToken
				newlab.push(lab[i])
			}
			// console.log(newDoctors)
			return newDoctors
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
			log = log + "\n" + `${formatDate(new Date())}: ${admin.name} viewed doctors list`
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
