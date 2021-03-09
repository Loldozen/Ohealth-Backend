const express = require('express')
const session=require('express-session')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
const Laboratory = require('../../../models/Lab/Laboratory')

router.get('/', function (request, response) {

	// let finder = { last_login: { $gt: tim } }
	// let finder = { $and: [{ verified: true }, { city: { $ne:null } }, { country: { $ne:null } }, { state: { $ne:null } }, { capacityPerDay : { $ne:null } }, { testCost : { $ne:null } }, { street : { $ne:null } }] }

	let labss = [];
	Laboratory.find({}, function(err, labs) {
		if (err) throw err;
		labs.forEach(lab => {
			if(lab.verified == true && lab.city != null && lab.city != ""&& lab.country != null && lab.country != ""&& lab.state != null && lab.state != ""&& lab.capacityPerDay != null && lab.capacityPerDay != ""&& lab.testCost != null && lab.testCost != ""&& lab.street != null && lab.street != ""){
				lab.wallet = null
				lab.verified = null
				lab.notifications = null
				lab.uniqueID = null
				lab.accountName = null
				lab.accountNumber = null
				lab.bankName = null
				lab.password = null
				lab.__v = null
				lab.currentToken = null
				labss.push(lab)
			}
			else{
				
			}
		});
		if (!labss || labss.length < 1) {
				// return response.status(400).json({ error: "Something went wrong, please contact the customer care" })
				return response.send({ labs:[], success: true})
			}
	
			return response.send({ labs: labss, success: true })
		 });
})

module.exports = router