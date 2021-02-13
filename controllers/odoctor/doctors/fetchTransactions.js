const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const User = require('../../../models/ohealth/User')
const Doctor = require('../../../models/odoctor/Doctor')
const Appointment = require('../../../models/both/Appointment')
const Transaction = require('../../../models/odoctor/Transaction')

router.post('/', [
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('currentToken').notEmpty().withMessage('token is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, mdcnNumber, } = request.body
	Doctor.findOne({ mdcnNumber, currentToken }, function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}

		Transaction.find({ doctorID: doctor._id }, null, { sort: { '_id': 'desc' } }, async function (err, transactions) {
			if (!transactions || transactions.length < 1) {
				// //Invalid credential
				// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
				return response.send({ success: true, transactions: [] })
			}
			// console.log(appointments)
			const users = await getUsers()

			let theTransactions = []
			let newTransaction
			for (let tr in transactions) {

				newTransaction = (transactions[tr]).toObject()
				delete newTransaction.__v
				newTransaction.userName = ''
				if (newTransaction.userID) {
					for (let u in users) {
						if (String(users[u]._id) == String(newTransaction.userID)) {
							newTransaction.userName = users[u].name
						}
					}

				}
				theTransactions.push(newTransaction)
			}

			return response.send({ transactions: theTransactions, success: true })



		}).catch(next)

	}).catch(next)

})


const getUsers = async () => {
	try {
		let users = await User.find()
		if (users) {
			return users
		}
		else {
			return []
		}
	}
	catch (error) {
		console.log(error)
	}
}

module.exports = router