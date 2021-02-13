const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
var app = express()
// app.use('/signup', require('./Labjson.json'))

const session = require('express-session')
router.use(session({
    secret: 'Lekxel4real@$%',
    reave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

router.get('/', function (request, response, next) {
        return response.render('index')  
})

module.exports = router

