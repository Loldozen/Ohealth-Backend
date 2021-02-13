const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync('./private.key')

var Admin = require('../../models/admin/Admin')
var User = require('../../models/ohealth/User')
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
					return res.render('fundUser', { pagetitle: 'oHealth - Fund User', adminPriviledge: adminEx });
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


//fund the user
router.post('/', [
	body('user').notEmpty().withMessage('user is required').bail().isString().withMessage('user must be either the username or the id'),
	body('amount').notEmpty().withMessage('amount is required').bail().isNumeric().withMessage('amount is not valid'),
],
	async function (req, res, next) {

		if (req.signedCookies.adminEmail && req.signedCookies.currentToken) {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.redirect('/admin/dashboard')
			}

			let { user, amount } = req.body
			const currentToken = req.signedCookies.currentToken
			const adminEmail = req.signedCookies.adminEmail
			try {
				var decoded = jwt.verify(currentToken, privateKey);
				// console.log(decoded)

				let adminEx = await adminExist(decoded.email)

				//If super admin

				if ((decoded.email == adminEmail) && adminEx) {
					if (adminEx && adminEx > 1) {
						//does the user even exist?
<<<<<<< HEAD
						let theUser = await User.findOne({ username: { $regex: user, $options: 'i' } })
						if (!theUser) {
							return res.render('fundUser', { pagetitle: 'oHealth - Fund User', adminPriviledge: adminEx, error: 'User does not exist' });
						}
						let fundTheUser = await User.findOneAndUpdate({ username: { $regex: user, $options: 'i' } }, { wallet: (parseFloat(theUser.wallet) + parseFloat(amount)).toFixed(2) })
=======
						let theUser = await User.findOne({ username: { $regex: '^' + user.toLowerCase() + '$', $options: 'i' } })
						if (!theUser) {
							return res.render('fundUser', { pagetitle: 'oHealth - Fund User', adminPriviledge: adminEx, error: 'User does not exist' });
						}
						let fundTheUser = await User.findOneAndUpdate({ username: { $regex: '^' + user.toLowerCase() + '$', $options: 'i' } }, { wallet: (parseFloat(theUser.wallet) + parseFloat(amount)).toFixed(2) })
>>>>>>> 14af74daf7eacb7d2e09e995ff242bbafbfb86ca
						let adminLog = await updateAdminLog(decoded.email, user, amount)
						return res.render('fundUser', { pagetitle: 'oHealth - Fund User', adminPriviledge: adminEx, success: `${theUser.name} has been funded with ${amount}NGN` });
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

const updateAdminLog = async (email, username, amount) => {
	try {
		let admin = await Admin.findOne({ email })
		if (!admin) {

			return false
		}
		else {
			let log = admin.log
			log = log + "\n" + `${formatDate(new Date())}: ${admin.name} funded ${username} with ${amount}NGN`
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


module.exports = router
