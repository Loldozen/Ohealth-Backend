const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
var app = express()
const Laboratory = require('../../models/Lab/Laboratory')
const BookUser = require('../../models/Lab/BookUser')

// app.use('/signup', require('./Labjson.json'))

const session = require('express-session')
router.use(session({
    secret: 'Lekxel4real@$%',
    reave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

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
        BookUser.find({labID:request.session.user._id}, function(err, bookings) {
          return response.render('dashboard/labdashboard', { pagetitle: 'Dashboard', success: success ? success : "", error : error ? error : "", state : user.verified ? "Verified"  : "Unverified",  user: request.session.user ? request.session.user : "", bookings : bookings ? bookings : [],  })
        })
    }).catch(next)
    } else{
        return response.redirect('/laboratory/login')  
    }   
})

router.post('/', function (request, response) {
    let {labID}  = request.body;
        BookUser.find({labID}, 
            function(err, bookings) {
                    let result = { };
                    for(var i = 0; i < bookings.length; ++i) {
                        if(!result[bookings[i].bookedDate])
                            result[bookings[i].bookedDate] = 0;
                        ++result[bookings[i].bookedDate];
                    }
          return response.send({bookings : result})  
        })  
})


module.exports = router

