const express = require('express')
const router = express.Router()
// const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
const LabBooking = require('../../../models/Lab/BookUser')
// const User=require('../../../models/ohealth/User')


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


    let { userID, labID, bookedDate } = request.body;
    
    let changeStatus = {
        userID,
        labID,
        bookedDate,
    }

    LabBooking.findOne({userID, labID, bookedDate}, function(err, data){
        LabBooking.updateOne({userID, labID, bookedDate}, {status: !data.status}, function(err, data2){
        })
    })
})

module.exports = router

