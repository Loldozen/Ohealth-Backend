const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
var app = express()
const Laboratory = require('../../models/Lab/Laboratory')

const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  cloud_name: 'ohealthng-com', 
  api_key: '838578422156265', 
  api_secret: 'eFWW8fjOiFPSDZPyetybhzd9dv0' 
});

// app.use('/signup', require('./controllers/ohealth/auth/register'))

const { assert } = require('console')
const { resolve } = require('path')


router.post('/', [
    body('name').notEmpty().withMessage('Name is required').bail().matches(new RegExp(`^[a-zA-Z ]+$`)).withMessage('Name contains invalid characters').bail().isLength({ min: 3, max: 25 }).withMessage('Name can only be between 3 and 25 chars long'),
    body('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Email is not valid'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required').bail().isMobilePhone().withMessage('Phone number is not valid').bail().isLength({ min: 11, max: 11 }).withMessage('Phone number can only be 11 chars long'),
    // body('DOB').notEmpty().withMessage('Date of Birth is required').bail().isString('Date of birth is Invalid'), 
], function(request, response, next) {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        // return response.status(422).send({ error: errors.array() })
        request.session.error = errors.array()
        return response.redirect('/laboratory/profile')
    }
    if(!request.session.user){
		return response.redirect('/laboratory/login')
	}
        let { name, email, phoneNumber, avatar, capacityPerDay, accountName, accountNumber, bankName, testCost, country, state, city, street, avatardata} = request.body;

    let newUser
    let logo   
        function avatardat(){
            return new Promise(resolve => {
                
                   (cloudinary.uploader.upload(avatardata, { folder: 'ohealth/labLogo/' +request. session.user.uniqueID + '/', width: 500, height: 500, crop: "fill" }, function (error, result) {
                       if (error) {
                        return response.redirect('/laboratory/profile')
                       }
                       try {
                           resolve(result.secure_url)
                       } catch (err) {
                        return response.redirect('/laboratory/profile')
                    }
                    })) 
                   
           }) 
        }
        async function updateProfile() {
            avatardata ? (logo = await avatardat()) : null;
            
        avatardata ? newUser = {
            email: email,
            name,
            phoneNumber,
            accountNumber,
            accountName,
            bankName,
            avatar: logo,
            street,
            capacityPerDay,
            accountName,
            accountNumber,
            bankName,
            testCost,
            country,
            state,
            city,
        } : newUser = {
            email: email,
            name,
            phoneNumber,
            accountNumber,
            accountName,
            bankName,
            street,
            capacityPerDay,
            accountName,
            accountNumber,
            bankName,
            testCost,
            country,
            state,
            city,
                }
            console.log(newUser);
              Laboratory.findOneAndUpdate({ currentToken: request.session.user.currentToken }, newUser).then(function (user) {
                Laboratory.findOne({ currentToken: user.currentToken }).then(function(user) {
                    request.session.user = user
                return response.redirect('/laboratory/profile')
                })
           })
        }
        updateProfile()
       
})

module.exports = router

const UniqueValue = d => {
    var dat_e = new Date();
    var uniqu_e = ((Math.random() * 1000) + "").slice(-4)

    dat_e = dat_e.toISOString().replace(/[^0-9]/g, "").replace(dat_e.getFullYear(), uniqu_e);
    if (d == dat_e)
        dat_e = UniqueValue(dat_e);
    return dat_e;
}