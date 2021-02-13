const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
const https = require('https');
// const Doctor = require('../../../models/odoctor/Doctor')
// const User = require('../../../models/ohealth/User')
// const Appointment = require('../../../models/both/Appointment')

var PaystackTransfer = require('paystack-transfer')('sk_live_71aab0f0f3329e52f57b4d99594118bc26686f51')
var allBanks = PaystackTransfer.all_banks;

router.post('/', [
	body('currentToken'),

], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	// return response.send(allBanks)

	// Create Recipient
	// let ss = 'guaranty_trust_bank'
	// PaystackTransfer.createRecipient("Lawal Lekan", "Withdrawal from oDoctor Account", "0273006573", allBanks[`${ss}`], {})
	// 	.then(function (body) {
	// 		// return response.send(body)
	// 		console.log(body.message)


	// 		//Make transfer
	// 		let source = 'balance'
	// 		let reason = 'oDoctor Withdrawal'
	// 		amount = 200
	// 		recipient = body.data.recipient_code
	// 		PaystackTransfer.initiateSingle(source, reason, amount, recipient)
	// 			.then(function (body) {
	// 				return response.send(body)
	// 			})
	// 			.catch(function (error) {
	// 				console.log(error);
	// 			});

	// 	})
	// 	.catch(function (error) {
	// 		console.log(error);
	// 	})

	// //Fetch a transfer
	// PaystackTransfer.fetchTransfer(code)
	// 	.then(function (body) {
	// 		console.log(body)
	// 	})
	// 	.catch(function (error) {
	// 		console.log(error);
	// 	});

	// //Resend OTP for a transaction
	// PaystackTransfer.resendOtp(transfer_code)
	// 	.then(function (body) {
	// 		console.log(body)
	// 	})
	// 	.catch(function (error) {
	// 		console.log(error);
	// 	});

	// //Finalize transfer with OTP
	// PaystackTransfer.finalize(transfer_code, otp)
	// 	.then(function (body) {
	// 		console.log(body)
	// 	})
	// 	.catch(function (error) {
	// 		console.log(error);
	// 	});


	// // // Disable OTP
	// PaystackTransfer.disableOtp(otp)
	// 	.then(function (body) {
	// 		return body
	// 	})
	// 	.catch(function (error) {
	// 		console.log(error);
	// 	});

	// // Finalize disabling OTP
	// PaystackTransfer.finalizeOtpDisable()
	// 	.then(function (body) {
	// 		return body
	// 	})
	// 	.catch(function (error) {
	// 		console.log(error);
	// 	});

	// // Enable OTP
	// PaystackTransfer.enableOtp()
	// 	.then(function (body) {
	//                     ...
	//                 })
	// .catch(function (error) {
	// 	console.log(error);
	// });

	// const params = JSON.stringify({
	// 	"otp": "479424"
	// })
	// const options = {
	// 	hostname: 'api.paystack.co',
	// 	port: 443,
	// 	path: '/transfer/disable_otp_finalize',
	// 	method: 'POST',
	// 	headers: {
	// 		Authorization: 'Bearer sk_live_71aab0f0f3329e52f57b4d99594118bc26686f51',
	// 		'Content-Type': 'application/json'
	// 	}
	// }
	// const req = https.request(options, resp => {
	// 	let data = ''
	// 	resp.on('data', (chunk) => {
	// 		data += chunk
	// 	});
	// 	resp.on('end', () => {
	// 		console.log(JSON.parse(data))
	// 		return JSON.parse(data)
	// 	})
	// }).on('error', error => {
	// 	console.error(error)
	// 	return
	// })
	// req.write(params)
	// req.end()

})

module.exports = router