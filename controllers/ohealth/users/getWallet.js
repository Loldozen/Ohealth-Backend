const User = require('../../../models/ohealth/User')


const getWallet = async socketID => {
	try {
		let user = await User.findOne({ socketID })
		if (user) {
			return user.wallet
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