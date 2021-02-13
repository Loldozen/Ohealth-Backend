const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
const cloudinary = require('cloudinary').v2

cloudinary.config({
	cloud_name: 'ohealthng-com',
	api_key: '838578422156265',
	api_secret: 'eFWW8fjOiFPSDZPyetybhzd9dv0'
});

const User = require('../../../models/ohealth/User')

router.post('/', [
	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('image').notEmpty().withMessage('Image is required').bail().isString('Image is Invalid'),
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

		let { image } = request.body
		// image = JSON.stringify(image)
		let hasPhoto = user.photo ? true : false
		let img_url = await uploadToCloudinary(image, user._id, hasPhoto)
		if (!img_url) {
			return response.send({ success: false })
		}
		let updateDoc = {
			photo: img_url
		}

		User.findOneAndUpdate({ username: { $regex: '^' + username.toLowerCase() + '$', $options: 'i' } }, updateDoc, { new: true })
			.then(function (user) {
				return response.send({ success: true, photo: img_url })
			}).catch(next)

	}).catch(next)

})

async function uploadToCloudinary(image, id, hasPhoto) {
	try {
		if (hasPhoto) {
			let des = await cloudinary.uploader.destroy('ohealth/userPhotos/' + id);
		}
		let url = await cloudinary.uploader.upload(image, { folder: 'ohealth/userPhotos/' + id + '/' });
		return url.secure_url
	}
	catch (err) {
		console.log(err)
	}
}

module.exports = router
