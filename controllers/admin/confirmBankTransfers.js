const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')
var User = require('../../models/ohealth/User')
var ConfirmBankTransfer = require('../../models/ohealth/ConfirmBankTransfer')
router.get('/', async function (req, res) {

	if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {

		const currentToken = req.signedCookies.currentToken
		const adminEmail = req.signedCookies.adminEmail
		try {
			var decoded = jwt.verify(currentToken, privateKey);
			// console.log(decoded)

			let adminEx = await adminExist(decoded.email)

			if ((decoded.email == adminEmail) && adminEx) {
				const transfers = await getTransfers()
				return res.render('confirmBankTransfers', { pagetitle: 'oHealth - Bank Transfer Confirmation', transfers, adminPriviledge: adminEx });
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

router.get('/confirm/:id', async function (req, res) {

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
					const transfer = await getTransfer(String(req.params.id))
					if (!transfer) {
						return res.redirect('/admin/dashboard')
					}
					let upd = await ConfirmBankTransfer.updateOne({ _id: req.params.id }, { confirmed: true })
					return res.redirect('/admin/confirmBankTransfers')
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


const getTransfers = async () => {
	try {
		let transfers = await ConfirmBankTransfer.find({}, null, { sort: { _id: -1 } })
		if (!transfers) {

			return []
		}
		else {
			let newtransfers = []
			for (let i in transfers) {
				delete transfers[i].__v
				newtransfers.push(transfers[i])
			}
			// console.log(newtransfers)
			return newtransfers
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


const getTransfer = async (id) => {
	try {
		let transfer = await ConfirmBankTransfer.findOne({ _id: id })
		if (!transfer) {

			return false
		}
		else {
			transfer = transfer.toObject()
			return transfer
		}
	}
	catch (error) {
		console.log(error)
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
