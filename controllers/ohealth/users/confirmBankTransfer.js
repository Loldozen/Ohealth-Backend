const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')

const User = require('../../../models/ohealth/User')
const ConfirmBankTransfer = require('../../../models/ohealth/ConfirmBankTransfer')


//Cloudinary media upload
const cloudinary = require('cloudinary').v2
cloudinary.config({
	cloud_name: 'ohealthng-com',
	api_key: '838578422156265',
	api_secret: 'eFWW8fjOiFPSDZPyetybhzd9dv0'
});


router.post('/', [
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('fundedUsername').notEmpty().withMessage('Funded Username is required').bail().isString().withMessage('Funded Username  is not valid'),
	body('fundedPhone').notEmpty().withMessage('Funded Phone is required').bail().isString().withMessage('Funded Phone  is not valid'),
	body('nameOnTransaction').notEmpty().withMessage('Name on Transaction is required').bail().isString().withMessage('Name on Transaction  is not valid'),
	body('senderPhone').notEmpty().withMessage('sender Phone is required').bail().isString().withMessage('sender Phone  is not valid'),
	body('amount').notEmpty().withMessage('amount is required').bail().isNumeric().withMessage('amount  is not valid'),
<<<<<<< HEAD
	body('image').notEmpty().withMessage('Image is required')
=======
	body('image')
>>>>>>> 14af74daf7eacb7d2e09e995ff242bbafbfb86ca
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, username, } = request.body
	User.findOne({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' }, currentToken }, async function (err, user) {
		if (!user) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}


		let { fundedUsername, fundedPhone, nameOnTransaction, senderPhone, amount, image } = request.body


		let newData = {
			userID: user._id, fundedUsername, fundedPhone, nameOnTransaction, senderPhone, amount
		}
		if (image) {
			let img_url = await uploadToCloudinary(image, user._id,)

			if (!img_url) {
				return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			}
			newData.image = img_url
		}


		// console.log(chargeU)
		ConfirmBankTransfer.create(newData).then(function (data) {

			return response.send({ success: true, })

		}).catch(next)
	}).catch(next)




})

async function uploadToCloudinary(image, userID) {
	try {

		let url = await cloudinary.uploader.upload(image, { folder: 'ohealth/bankTransferConfirmation/' + userID + '/' + (new Date().getTime().toString().substring(0, 8)) + '/' });
		return url.secure_url
	}
	catch (err) {
		console.log(err)
	}
}

module.exports = router
