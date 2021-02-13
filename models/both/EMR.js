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


const EMRSchema = new Schema({
	userID: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	doctorID: {
		type: mongoose.Types.ObjectId,
		required: true
	},
	doctorsNote: DoctorsNoteSchema,
	prescriptions: PrescriptionsSchema,
	treatmentPlan: TreatmentPlanSchema,

})

const EMR = mongoose.model('EMR', EMRSchema)
module.exports = EMR