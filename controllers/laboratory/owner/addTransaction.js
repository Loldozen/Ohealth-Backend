const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
const mailgun = require('mailgun-js')

const Laboratory = require('../../../models/Lab/Laboratory')

const DOMAIN = 'onlinehealthng.com';
const mg = mailgun({apiKey: "42fe0a8e79d9d4aa4e4430558db6d9aa-77751bfc-4c679a37", domain: DOMAIN});

var PaystackTransfer = require('paystack-transfer')('sk_live_71aab0f0f3329e52f57b4d99594118bc26686f51')
var allBanks = PaystackTransfer.all_banks;


router.post('/', function (request, response, next) {
     let { accountName, accountNumber, bankName, wallet, _id, name, email } = request.session.user
    const full = async () =>{
            let sess = request.session
            let ress = response

			if (parseFloat(wallet) < 100) {
            request.session.error = [{ msg: 'The amount must be up to 100 naira' }]
				return response.redirect('/laboratory/dashboard');
			}
			if ((!bankName) || (!accountName) || (!accountNumber)) {
                request.session.error = [{ msg: 'Please fill your account details or update your profile' }]
				return response.redirect('/laboratory/dashboard');
			}

            let transfer = await createTransfer(bankName, accountNumber, accountName, wallet * 100, sess, ress, _id)
            
			if (!transfer) {
                request.session.error = [{ msg: 'An error occured! Please contact customer care' }]
				return response.redirect('/laboratory/dashboard');
			}
			else if (!transfer.data) {
                request.session.error = [{msg: transfer.message ? transfer.message : 'An error occured! Please contact customer care' }]
				return response.redirect('/laboratory/dashboard');
			}


			if (transfer.data.status == 'success') {
				newTransaction.status = "Completed"
			}

			// Transaction.create(newTransaction).then(async function (transaction) {

			// 	// return response.send({ success: true })
			// 	let newTransfer = { transactionID: transaction._id, wallet, transferCode: transfer.data.transfer_code, labID: _id, reference: transfer.data.reference, id: transfer.data.id }
			// 	switch (transfer.data.status) {
			// 		case 'success':
			// 			newTransfer.status = "Success"
			// 			break;
			// 		case 'pending':
			// 			newTransfer.status = "Pending"
			// 			break;
			// 		case 'otp':
			// 			newTransfer.status = "OTP"
			// 			break;

			// 		default:
			// 			newTransfer.status = "Failed"
			// 			break;
			// 	}
			// 	Transfer.create(newTransfer).then(async function (trans) {
            //         // return response.send({ success: true })
            //         request.session.success = [{success : "Withdrawal successful"}]
            //         return response.redirect('/laboratory/dashboard');
			// 	}).catch(next)


			// }).catch(next)

    }
    
   
    full()
})


const createTransfer = async (bankName, accountNumber, accountName, wallet, sess, ress, _id) => {


	let response
	try {
		let res1 = await PaystackTransfer.createRecipient(accountName, "Withdrawal from Ohealth Laboratory Account", accountNumber, allBanks[`${bankName}`], {})
		// .then(async function (body) {
		// 	// return response.send(body)
        // 	let res1 = body
        console.log(res1);
            // sess.error = [{ msg: res1.message}]
			// return ress.redirect('/laboratory/dashboard');
		if (!res1.status) {
            // console.log(res1)
            sess.error = [{ msg: res1.message}]
			return ress.redirect('/laboratory/dashboard');
			// return res1
		}
		else {
			// console.log('hhh')
			console.log(res1.message)


			//Make transfer
			let source = 'balance'
			let reason = 'Ohealth Laboratory Withdrawal'
			// amount = 200
			recipient = res1.data.recipient_code
			let res = await PaystackTransfer.initiateSingle(source, reason, wallet, recipient)
			// .then(async function (body) {
			// 	let res = await body
			if (res.status) {
            //    
            // return ress.redirect('/laboratory/dashboard');
                sess.success = [{ msg: res.message}];
                Laboratory.updateOne({_id:_id},{$set:{wallet: 0}},async function(err, done){
                    if(err) console.warn(err);
                 await sendAnEmail(email, name, wallet)

                })
                return ress.redirect('/laboratory/dashboard');
				// return res
			}
			else { 
                sess.error = [{ msg: res.message}];
                return ress.redirect('/laboratory/dashboard');
				// return false
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

let sendAnEmail = (email, name, wallet) =>{
    const data = {
        from: 'OHEALTH <contact@ohealthng.com>',
        to: email,
        subject: 'Withdrawal from OHEALTH',
        html:  'Hi '+ name+ ' you just withdraw a sum of'+ wallet +' from your OHEALTH wallet. Be patient as withdrawal may take a few minutes',
        text: 'Hi '+ name+ ' you just withdraw a sum of'+ wallet +' from your OHEALTH wallet. Be patient as withdrawal may take a few minutes',
    }
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}

module.exports = router

