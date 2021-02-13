const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
const https = require('https');
const User = require('../../../models/ohealth/User')

router.post('/', [

	body('reference').notEmpty().withMessage('reference is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, userID, reference } = request.body


	let options = {
		headers: {
			'Authorization': " Bearer sk_live_71aab0f0f3329e52f57b4d99594118bc26686f51"
			// 'Authorization': " Bearer sk_test_27e8cc2f9869602542e59592a2c9e1f2ee5ea661"
		}
	}
	https.get('https://api.paystack.co/transaction/verify/' + reference, options, function (res) {
		var str = '';
		console.log('Response is ' + res.statusCode);

		res.on('data', function (chunk) {
			str += chunk;
		});

		res.on('end', function () {
			str = JSON.parse(str)
			console.log(str);

			if (str.status === true && str.data.status === 'success') {

				User.findOne({ _id: userID, currentToken }, function (err, user) {
					if (!user) {
						//Invalid credential
						return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
					}

					User.findOneAndUpdate({ _id: userID }, { wallet: (user.wallet + (str.data.amount / 100)).toFixed(2) }, { new: true })
						.then(function (user1) {
							return response.send({ success: true, user: user1 })
						}).catch(next)
				}).catch(next)

			}
			else {
				return response.status(422).send({ error: 'Reference code not recognised.' })
			}

		});

	});

})

module.exports = router