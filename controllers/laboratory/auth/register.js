const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
var app = express()
const Laboratory = require('../../../models/Lab/Laboratory')

const mailgun = require('mailgun-js')
const DOMAIN = 'onlinehealthng.com';
const mg = mailgun({apiKey: "42fe0a8e79d9d4aa4e4430558db6d9aa-77751bfc-4c679a37", domain: DOMAIN});


router.get('/', function(request, response) { 
    request.session.state = ""
    if (!request.session.user) {
        var error = request.session.error;
        request.session.error = ""
        return response.render('sign-up', { pagetitle: 'Sign Up Page', error: "", error: error ? error : ""})
    }
    return response.redirect('/laboratory/dashboard')
})

router.post('/', [
    body('name').notEmpty().withMessage('Name is required').bail().matches(new RegExp(`^[a-zA-Z ]+$`)).withMessage('Name contains invalid characters').bail().isLength({ min: 3, max: 25 }).withMessage('Name can only be between 3 and 25 chars long'),
    body('email').notEmpty().withMessage('Email is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required').bail().isMobilePhone().withMessage('Phone number is not valid').bail().isLength({ min: 11, max: 11 }).withMessage('Phone number can only be 11 chars long'),
    body('password').notEmpty().withMessage('Password is required').bail().isLength({ min: 5, max: 24 }).withMessage('Password should be of length between 5 and 24'),
    body('cpassword').notEmpty().withMessage('Confirm Password is required').bail().custom((value, { req }) => value === req.body.password).withMessage('Password does not match'),
    // body('DOB').notEmpty().withMessage('Date of Birth is required').bail().isString('Date of birth is Invalid'), 
], function(request, response, next) {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        // return response.status(422).send({ error: errors.array() })
        request.session.error = errors.array()
        return response.redirect('/laboratory/register')
    }
        let { name, email, phoneNumber, password, avatar, wallet, capacityPerDay, accountName, accountNumber, bankName, testCost, country, state, city, address, currentToken, notifications } = request.body;

    let newUser = {
        email: email,
        name,
        phoneNumber,
        password,
        accountNumber,
        accountName,
        bankName,
        avatar,
        address,
        wallet,
        capacityPerDay,
	    accountName,
	    accountNumber,
	    bankName,
	    testCost,
	    country,
	    state,
        city,
	    address,
	    currentToken,	
	    notifications,
        uniqueID: UniqueValue(100).substr(0, 12)
    }

    bcrypt.hash(password, 10, function(err, hash) {
        newUser.password = hash,
            Laboratory.findOne({email:email}).then(function (user) {
            	if(user){
                    request.session.error = [{ msg: "Email is already registered" }]
                    return response.redirect('/laboratory/register')
                }
                 Laboratory.create(newUser).then(async function(user) {
                request.session.user = user
                await sendAnEmail(email, name)
                if (user.verified) {
                    return response.redirect('/laboratory/dashboard')
                    }
                    else{
                     request.session.state = [{ msg: "Unverified" }]
                      return response.redirect('/laboratory/dashboard')
                       }
            }).catch(next)
            })
           
    })
})

let sendAnEmail = (email, name) =>{
    const data = {
        from: 'OHEALTH <contact@ohealthng.com>',
        to: email,
        subject: 'Welcome to OHEALTH',
        html: 'Hi '+ name+ ' you are welcome to OHEALTH. We promise a seamless service.',
        text: 'Hi '+ name+ ' you are welcome to OHEALTH. We promise a seamless service.'
    }
     mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}

module.exports = router

const UniqueValue = d => {
    var dat_e = new Date();
    var uniqu_e = ((Math.random() * 1000) + "").slice(-4)

    dat_e = dat_e.toISOString().replace(/[^0-9]/g, "").replace(dat_e.getFullYear(), uniqu_e);
    if (d == dat_e)
        dat_e = UniqueValue(dat_e);
    return dat_e;
}

