const express = require('express')
const router = express.Router()
var Admin = require('../../models/admin/Admin')
const { body, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const bcrypt = require('bcrypt')
const privateKey = fs.readFileSync('./private.key')

router.get('/', function (req, res) {
	res.render('login', { pagetitle: 'Login to Admin Panel' });
});
router.get('/logout', function (req, res) {
	res.clearCookie('currentToken')
	res.clearCookie('adminName')
	res.clearCookie('adminEmail')
	return res.redirect('/admin/login')
});

router.post('/', [
	body('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Email is not valid'),
	body('password').notEmpty().withMessage('Password is required').bail().isString().withMessage('Password is invalid'),
], function (request, response, next) {
	// res.cookie('name', "lekd", { signed: true })
	// console.log(req.signedCookies.name)
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.render('login', { pagetitle: 'Login to Admin Panel', errors: errors.array() });
	}

	let { email, password } = request.body

	Admin.findOne({ email }, function (err, admin) {
		if (!admin) {
			//Invalid credential
			return response.render('login', { pagetitle: 'Login to Admin Panel', error: "Admin does not exist" });
		}

		bcrypt.compare(password, admin.password, function (err, res) {
			if (res) {
				let { name, phoneNumber, email, verified, log } = admin
				if (!verified) {
					return response.render('login', { pagetitle: 'Login to Admin Panel', error: "This account is currently not active." });
				}

				const token = jwt.sign({ name, phoneNumber, email }, privateKey)
				log = log + "\n" + `${formatDate(new Date())}: ${name} signed in`
				Admin.findOneAndUpdate({ email }, { currentToken: token, log }, { new: true })
					.then(function (adm) {
						response.cookie('currentToken', token, { signed: true })
						response.cookie('adminName', adm.name, { signed: true })
						response.cookie('adminEmail', adm.email, { signed: true })
						// response.render('login', { pagetitle: 'Login to Admin Panel', message: 'Hello there!' });
						return response.redirect('/admin/dashboard')
					}).catch(
						err => {
							console.log(err)
							response.render('login', { pagetitle: 'Login to Admin Panel', error: "Something went wrong!" })
						}
					)

			}
			else {
				return response.render('login', { pagetitle: 'Login to Admin Panel', error: "Incorrect Password" })
			}
		})



	}).catch(
		err => response.render('login', { pagetitle: 'Login to Admin Panel', error: "Something went wrong!" })
	)
});


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