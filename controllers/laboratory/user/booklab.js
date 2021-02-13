 const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
const LabBooking = require('../../../models/Lab/BookUser')
const User=require('../../../models/ohealth/User')
const Laboratory = require('../../../models/Lab/Laboratory')


// router.post('/', [
// 	body('username').notEmpty().withMessage('Username is required').bail().matches(`^[a-zA-Z0-9_]+$`).withMessage('Username contains invalid characters').bail().isLength({ min: 3, max: 15 }).withMessage('Username can only be between 3 and 15 chars long'),
// 	body('currentToken').notEmpty().withMessage('token is required'),
// 	body('specialist')
// ], function (request, response, next) {
// 	const errors = validationResult(request)
// 	if (!errors.isEmpty()) {
// 		return response.status(422).send({ error: errors.array() })
// 	}
router.post('/', function (request, response, next) {

	// let finder = { $and: [{ verified: true }, { $and: [{ city: { $ne: null } }, { country: { $ne: null } }, { state: { $ne: null } }, { capacityPerDay : { $ne: null } }, { testCost : { $ne: null } }, { street : { $ne: null } }] }] }


    let { name, email, phoneNumber, userID, labID, bookedDate, gender, new_wallet, status } = request.body;
    
    let newUser = {
        email,
        name,
        phoneNumber,
        userID,
        labID,
        bookedDate,
        gender,
        status,
    }
    
    User.findOneAndUpdate({_id:userID}, {wallet: new_wallet}, function(err, done){
        if(err) console.warn(err);
        Laboratory.findOne({_id:labID},function(err, lab){
            if(err) console.warn(err);
            Laboratory.updateOne({_id:labID},{$set:{wallet: (lab.wallet+(lab.testCost * 0.95))}},function(err, done){
                if(err) console.warn(err);
                 LabBooking.create(newUser).then(function(user) {
                return response.send({success: true})
            }).catch(next)
          })
        })
    })
})

module.exports = router

