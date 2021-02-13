const Doctor = require('../../../models/odoctor/Doctor')

const removeSocketDoctor = async socketID => {
	let res
	try {
		res = await Doctor.findOne({ socketID })
		// socketID = JSON.stringify(socketID)
		let updateDoc = {
			socketID: '',
			online: false
		}

		Doctor.findOneAndUpdate({ socketID }, updateDoc, { new: true })
			.then(function (doctor) {
				console.log('unset')
				// return response.send({ success: true, doctor })

			}).catch(err => {

			})
		return res
	}
	catch (e) {
		console.log(e)
	}

}


module.exports = removeSocketDoctor