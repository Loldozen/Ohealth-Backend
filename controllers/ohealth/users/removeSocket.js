const User = require('../../../models/ohealth/User')


const removeSocketUser = socketID => {
	User.findOne({ socketID }, function (err, user) {
		if (!user) {
			// //Invalid credential
			// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
			return false
		}

		// socketID = JSON.stringify(socketID)
		let updateDoc = {
			socketID: '',
			online: false
		}

		User.findOneAndUpdate({ socketID }, updateDoc, { new: true })
			.then(function (user) {
				console.log('unset')
				// return response.send({ success: true, user })
			}).catch(err => {
				return false
			})

	}).catch(err => {
		return false
	})

}

module.exports = removeSocketUser