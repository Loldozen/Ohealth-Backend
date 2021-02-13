const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BeneficiarySchema = new Schema({
	name: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true
	},
	relationship: {
		type: String,
		required: true,
	},
})

const Beneficiary = mongoose.model('Beneficiary', BeneficiarySchema)
module.exports = Beneficiary