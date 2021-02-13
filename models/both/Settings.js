const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SettingsSchema = new Schema({
	chatPrice: {
		type: Number,
		default: 40
	},
	audioPrice: {
		type: Number,
		default: 200
	},
	videoPrice: {
		type: Number,
		default: 300
	},
	adminRegistration: {
		type: Boolean,
		default: true
	},
	charge: {
		type: Number,
		min: 0,
		max: 100,
		default: 60
	},
	adminShare: {
		type: Number,
		default: 0.00
	},
	adminDailyShare: {
		type: Object,
		default: { date: '', amount: 0 }
	}
})

const Settings = mongoose.model('Settings', SettingsSchema)
module.exports = Settings
