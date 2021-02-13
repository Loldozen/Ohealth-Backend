const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DoctorsNoteSchema = new Schema({
	complains: {
		type: String
	},
	assessment: {
		type: String
	},
	date: {
		type: Number,
		default: new Date()
	},
	doctorID: {
		type: mongoose.Types.ObjectId
	}
})

const PrescriptionsSchema = new Schema({
	prescriptions: {
		type: String
	},

	date: {
		type: Number,
		default: new Date()
	},
	expiry: {
		type: String,
	},
	doctorID: {
		type: mongoose.Types.ObjectId
	}
})

const TreatmentPlanSchema = new Schema({

	treatment_plan: {
		type: String
	},
	date: {
		type: Number,
		default: new Date()
	},
	doctorID: {
		type: mongoose.Types.ObjectId
	}
})


const UserSchema = new Schema({
	name: {
		type: String,
		required: true,
		lowercase: true
	},
	email: {
		type: String,
		// required: true,
		// unique: true,
		lowercase: true,
		trim: true
	},
	phoneNumber: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	photo: {
		type: String
	},
	password: {
		type: String,
		required: true
	},
	username: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	wallet: {
		type: Number,
		default: 0.00
	},
	gender: {
		required: true,
		type: String,
		enum: ['Male', 'Female', 'Others']
	},
	DOB: {
		type: String
	},
	bloodGroup: {
		type: String,
	},
	genotype: {
		type: String
	},
	height: {
		type: String
	},
	weight: {
		type: String
	},
	country: {
		type: String
	},
	state: {
		type: String
	},
	address: {
		type: String
	},
	currentToken: {
		type: String
	},
	verified: {
		type: Boolean,
		default: true
	},
	socketID: {
		type: String
	},
	online: {
		type: Boolean,
		default: false
	},
	fcm_token: {
		type: String
	},
	last_login: {
		type: Number,
	},
	doctorsNote: DoctorsNoteSchema,
	prescriptions: PrescriptionsSchema,
	treatmentPlan: TreatmentPlanSchema,
	uniqueID: {
		type: String
	},
	notifications: {
		type: Array
	},
	recoveryCode: {
		type: String
	}
})

const User = mongoose.model('User', UserSchema)
module.exports = User
