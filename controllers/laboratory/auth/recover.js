const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
const nodemailer = require("nodemailer");
const privateKey = fs.readFileSync('./private.key')
const Laboratory = require('../../../models/Lab/Laboratory')
const mailgun = require('mailgun-js')
const DOMAIN = 'onlinehealthng.com';
const mg = mailgun({apiKey: "42fe0a8e79d9d4aa4e4430558db6d9aa-77751bfc-4c679a37", domain: DOMAIN});


router.get('/', function(request, response) {
    if (!request.session.user) {
        var error = request.session.error;
        request.session.error = ""
        return response.render('forgotpassword', { pagetitle: 'Recovery Page', error: "", error: error ? error : "" })
    }
    return response.redirect('/laboratory/dashboard')
})
router.get('/reset', function(request, response) {
    if (!request.session.user) {
        var error = request.session.error;
        request.session.error = ""
        return response.render('reset', { pagetitle: 'Reset Page', error: "", error: error ? error : "" })
    }
    return response.redirect('/laboratory/dashboard')
})

router.post('/', [
    body('email').notEmpty().withMessage('email is required').bail().isEmail().withMessage('Email is not valid')
], function(request, response, next) {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        // return response.status(422).send({ error: errors.array() })
        request.session.error = errors.array()
        return response.redirect('/laboratory/recover')
    }

    let { email } = request.body
    Laboratory.findOne({ email }, function(err, lab) {

        if (!lab) {
            // return response.status(400).json({ error: "Lab does not exist" })
            request.session.error = [{ msg: "Laboratory does not exist" }]
            return response.redirect('/laboratory/recover')
        }

        let recoveryCode = UniqueValue(0).slice(-5)

        Laboratory.findOneAndUpdate({ email }, { recoveryCode }, { new: true })
            .then( async function(labo) {
                const {name} = labo
                await sendAnEmail(email, recoveryCode, name)
                // return response.send({ success: true })
                console.log(email, recoveryCode, name);
                return response.redirect('/laboratory/recover/reset')

            }).catch(next)

    }).catch(next)
})

router.post('/confirm', [
    body('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('email is not valid'),
    body('recoveryCode').notEmpty().withMessage('recoveryCode is required').bail().isString().withMessage('recoveryCode is not valid'),
    body('password').notEmpty().withMessage('Password is required').bail().isLength({ min: 5, max: 24 }).withMessage('Password should be of length between 5 and 24'),
    body('cpassword').notEmpty().withMessage('Confirm Password is required').bail().custom((value, { req }) => value === req.body.password).withMessage('Passwords does not match'),
], function(request, response, next) {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        // return response.status(422).send({ error: errors.array() })
        request.session.error = errors.array()
        return response.redirect('/laboratory/recover/reset')
    }

    let {email, password, recoveryCode } = request.body
    Laboratory.findOne({ recoveryCode }, function(err, lab) {

        if (!lab) {
            // return response.status(400).json({ error: "lab does not exist" })
            request.session.error = [{ msg: "Please enter a valid recovery code or email" }]
            return response.redirect('/laboratory/recover/reset')
        }
        if (recoveryCode == lab.recoveryCode) {
            bcrypt.hash(password, 10, function(err, hash) {
                Laboratory.findOneAndUpdate({ email }, { recoveryCode: '', password: hash }, { new: true })
                    .then(function(lab) {
                        request.session.success = [{ msg: "Reset successful. Log in" }]
                        return response.redirect('/laboratory/login')
                    }).catch(next)
            })
        } else {
            // return response.status(400).json({ error: "Recovery code  is incorrect!" })
            request.session.error = [{ msg: "Recovery code  is incorrect!" }]
            return response.redirect('/laboratory/recover/reset')
        }

    }).catch(next)
})


const UniqueValue = d => {
    var dat_e = new Date();
    var uniqu_e = ((Math.random() * 1000) + "").slice(-4)

    dat_e = dat_e.toISOString().replace(/[^0-9]/g, "").replace(dat_e.getFullYear(), uniqu_e);
    if (d == dat_e)
        dat_e = UniqueValue(dat_e);
    return dat_e;
}

let sendAnEmail = (email, recoveryCode, name) =>{
    const data = {
        from: 'OHEALTH <contact@ohealthng.com>',
        to: email,
        subject: 'Password Reset OHEALTH',
        html: 'Hi '+ name+ '! your recovery code is '+ recoveryCode,
        text: ('Hi '+ name+ '! your recovery code is '+ recoveryCode)
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}


module.exports = router


