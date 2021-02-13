const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')

const Transaction = require('../../../models/odoctor/Transaction')
const Transfer = require('../../../models/odoctor/Transfer')
const Doctor = require('../../../models/odoctor/Doctor')
var PaystackTransfer = require('paystack-transfer')('sk_live_71aab0f0f3329e52f57b4d99594118bc26686f51')
var allBanks = PaystackTransfer.all_banks;

router.post('/', [
	body('userID'),
	body('appointmentID'),
	body('appointmentType'),
	body('description'),
	body('bankName'),
	body('accountName'),
	body('accountNumber'),
	body('mdcnNumber').notEmpty().withMessage('MDCN number is required').bail().isString().withMessage('MDCN number is not valid').bail().isLength({ min: 5, max: 30 }).withMessage('MDCN number can only be between 5 and 30 chars'),
	body('type').notEmpty().withMessage('type is required').bail().isString().withMessage('type is not valid').bail().isIn(['Credit', 'Debit']),
	body('amount').notEmpty().withMessage('amount is required').bail().isFloat().withMessage('amount is invalid'),
	body('currentToken').notEmpty().withMessage('token is required'),
], function (request, response, next) {
	const errors = validationResult(request)
	if (!errors.isEmpty()) {
		return response.status(422).send({ error: errors.array() })
	}

	let { currentToken, mdcnNumber, } = request.body

	Doctor.findOne({ mdcnNumber, currentToken }, async function (err, doctor) {
		if (!doctor) {
			//Invalid credential
			return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
		}


		let { userID, appointmentID, type, appointmentType, description, amount, bankName, accountNumber, accountName } = request.body

		if (type == 'Debit') {
			if (doctor.wallet < parseFloat(amount)) {

				return response.status(422).send({ error: 'Your account balance is lower than the amount' })
			}

			if (parseFloat(amount) < 100) {

				return response.status(422).send({ error: 'The amount must be up to 100naira' })
			}
			if ((!bankName) || (!accountName) || (!accountNumber)) {
				return response.status(422).send({ error: 'Please fill your account details' })
			}

			let transfer = await createTransfer(bankName, accountNumber, accountName, amount * 100)
			// console.log(transfer)
			if (!transfer) {
				return response.status(500).send({ error: 'An error occured! Please contact customer care' })
			}
			else if (!transfer.data) {
				return response.status(500).send({ error: transfer.message ? transfer.message : 'An error occured! Please contact customer care' })
			}
			await setWalletDoctor(amount, doctor._id)


			let newTransaction = {
				userID, appointmentID, type, appointmentType, description, amount, doctorID: doctor._id
			}

			if (transfer.data.status == 'success') {
				newTransaction.status = "Completed"
			}

			Transaction.create(newTransaction).then(async function (transaction) {

				// return response.send({ success: true })
				let newTransfer = { transactionID: transaction._id, amount, transferCode: transfer.data.transfer_code, doctorID: doctor._id, reference: transfer.data.reference, id: transfer.data.id }
				switch (transfer.data.status) {
					case 'success':
						newTransfer.status = "Success"
						break;
					case 'pending':
						newTransfer.status = "Pending"
						break;
					case 'otp':
						newTransfer.status = "OTP"
						break;

					default:
						newTransfer.status = "Failed"
						break;
				}
				Transfer.create(newTransfer).then(async function (trans) {

					return response.send({ success: true })
				}).catch(next)


			}).catch(next)

		}


		else {

			let newTransaction = {
				userID, appointmentID, type, appointmentType, description, amount, doctorID: doctor._id
			}

			Transaction.create(newTransaction).then(async function (transaction) {

				return response.send({ success: true })
			}).catch(next)

		}


	}).catch(next)

})

const setWalletDoctor = async (amount, doctorID) => {

	try {
		let doctor = await Doctor.findOne({ _id: doctorID })
		let re = await Doctor.findOneAndUpdate({ _id: doctorID }, { wallet: (doctor.wallet - amount).toFixed(2) }, { new: true })
	}
	catch (error) {
		console.log(error)
	}
}

const createTransfer = async (bankName, accountNumber, accountName, amount) => {
	let response
	try {
		let res1 = await PaystackTransfer.createRecipient(accountName, "Withdrawal from oDoctor Account", accountNumber, allBanks[`${bankName}`], {})
		// .then(async function (body) {
		// 	// return response.send(body)
		// 	let res1 = body
		if (!res1.status) {
			console.log(res1)
			return res1
		}
		else {
			// console.log('hhh')
			console.log(res1.message)


			//Make transfer
			let source = 'balance'
			let reason = 'oDoctor Withdrawal'
			// amount = 200
			recipient = res1.data.recipient_code
			let res = await PaystackTransfer.initiateSingle(source, reason, amount, recipient)
			// .then(async function (body) {
			// 	let res = await body
			if (res.status) {
				return res
			}
			else {
				console.log(res)
				return false
			}
			// })
			// .catch(async function (error) {
			// 	console.log(error);
			// 	return false
			// });
		}

		// })
	}
	catch (error) {
		console.log(error);
		return false
	}

}

module.exports = router