const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
var app = express()
const Laboratory = require('../../models/Lab/Laboratory')

// app.use('/signup', require('./controllers/ohealth/auth/register'))


router.get('/', function (request, response, next) {
    if (request.session.user) {
        var success = request.session.success;
        var error = request.session.error;
        request.session.success = "";
        request.session.error = "";
        Laboratory.findOne({ email: request.session.user.email, currentToken:  request.session.user.currentToken  }).then(function(user) {
            // console.log(user);
        request.session.user = user;
        let { currentToken, name, email, _id } = user
        Laboratory.find({labID:request.session.user._id}, function(err, bookings) {
          return response.render('dashboard/labprofile', { pagetitle: 'Profile', success: success ? success : "", error : error ? error : "", state : user.verified ? "Verified"  : "Unverified",  user: request.session.user ? request.session.user : "", bookings : bookings ? bookings : [],  })
        })
    }).catch(next)
    } else{
        return response.redirect('/laboratory/login')  
    }   
})


module.exports = router

