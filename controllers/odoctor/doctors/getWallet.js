const Doctor = require('../../../models/odoctor/Doctor')


const getWallet = async socketID => {
	try {
		let doctor = await Doctor.findOne({ socketID })
		if (doctor) {
			return doctor.wallet
		}
		else {
			return false
		}
	}
	catch (e) {
		console.log(e)
	}

}

module.exports = getWallet