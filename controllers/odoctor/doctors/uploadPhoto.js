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

const Doctor = require('../../../models/odoctor/Doctor')

router.post('/', [
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('currentToken').notEmpty().withMessage('token is required'),
	body('image').notEmpty().withMessage('Image is required').bail().isString('Image is Invalid'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, mdcnNumber, } = request.body
	Doctor.findOne({ mdcnNumber, currentToken }, async function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}

		let { image } = request.body
		let hasPhoto = doctor.photo ? true : false
		let img_url = await uploadToCloudinary(image, doctor._id, hasPhoto)
		// image = JSON.stringify(image)
		if (!img_url) {
			return response.send({ success: false })
		}
		let updateDoc = {
			photo: img_url
		}

		Doctor.findOneAndUpdate({ mdcnNumber }, updateDoc, { new: true })
			.then(function (doc) {
				let doctor = doc.toObject()
				delete doctor.__v
				delete doctor.password
				return response.send({ success: true, photo: img_url })
			}).catch(next)

	}).catch(next)

})
async function uploadToCloudinary(image, id, hasPhoto) {
	try {
		if (hasPhoto) {
			let des = await cloudinary.uploader.destroy('ohealth/adminPhotos/' + id);
		}
		let url = await cloudinary.uploader.upload(image, { public_id: 'ohealth/doctorPhotos/' + id });
		return url.secure_url
	}
	catch (err) {
		console.log(err)
	}
}
module.exports = router
