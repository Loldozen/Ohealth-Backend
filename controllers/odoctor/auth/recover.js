const nodemailer = require("nodemailer");
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const privateKey = fs.readFileSync('./private.key')
const Doctor = require('../../../models/odoctor/Doctor')

router.post('/', [
	body('email').notEmpty().withMessage('email is required').bail().isEmail().withMessage('email is not valid')
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { email } = request.body
	Doctor.findOne({ email }, function (err, doctor) {

		if (!doctor) {
			return response.status(400).json({ error: "Doctor does not exist" })
		}

		let recoveryCode = UniqueValue(0)

		Doctor.findOneAndUpdate({ email }, { recoveryCode }, { new: true })
			.then(function (doc) {

				sendAnEmail(email, recoveryCode, doc.name).catch(console.error);
				return response.send({ success: true })

			}).catch(next)

	}).catch(next)
})

router.post('/confirm', [
	body('email').notEmpty().withMessage('email is required').bail().isEmail().withMessage('email is not valid'),
	body('recoveryCode').notEmpty().withMessage('recoveryCode is required').bail().isString().withMessage('recoveryCode is not valid'),
	body('password').notEmpty().withMessage('Password is required').bail().isLength({ min: 5, max: 24 }).withMessage('Password should be of length between 5 and 24'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { email, password, recoveryCode } = request.body
	Doctor.findOne({ email }, function (err, doctor) {

		if (!doctor) {
			return response.status(400).json({ error: "Doctor does not exist" })
		}
		if (recoveryCode == doctor.recoveryCode) {
			bcrypt.hash(password, 10, function (err, hash) {
				Doctor.findOneAndUpdate({ email }, { recoveryCode: '', password: hash }, { new: true })
					.then(function (doc) {

						return response.send({ success: true })

					}).catch(next)
			})
		}

		else {
			return response.status(400).json({ error: "Recovery code  is incorrect!" })
		}

	}).catch(next)
})


const UniqueValue = d => {
	var dat_e = new Date();
	var uniqu_e = ((Math.random() * 1000) + "").slice(-4)

	dat_e = dat_e.toISOString().replace(/[^0-9]/g, "").replace(dat_e.getFullYear(), uniqu_e);
	if (d == dat_e)
		dat_e = UniqueValue(dat_e);
	return dat_e;
}

async function sendAnEmail(email, code, name) {
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	let testAccount = await nodemailer.createTestAccount();

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: "mail.ohealthng.com",
		port: 465,
		secure: true, // true for 465, false for other ports
		auth: {
			user: 'support@ohealthng.com', // generated ethereal user
			pass: 'Ohe4lth?', // generated ethereal password
		},
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"Ohealth 👻" <support@ohealthng.com>', // sender address
		to: email, // list of receivers
		subject: "Password Recovery Request ✔", // Subject line
		// text: `Hello ${name}`, // plain text body
		html: `<b>Hello ${name}</b>,<br>
		You requested to reset your account password.
		Your verification code is <b>${code}</b>.
		<br>
		Please open the app and confirm your password recovery.
		<br><br>
		<b>Ohealth Team</b>
		`, // html body
	});

	console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}


module.exports = router
