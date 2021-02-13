const Doctor = require('../../../models/odoctor/Doctor')

const onlineDoctors = () => {
	global.sendDoc = { doctors: {} }
	Doctor.find({ online: true }, function (err, doctors) {
		if (!doctors) {
			// //Invalid credential
			// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			return false
		}
		console.log(doctors)
		global.sendDoc = { doctors, success: true }

	}).catch(err => {
		return {}
	})

	return global.sendDoc
}


module.exports = onlineDoctors