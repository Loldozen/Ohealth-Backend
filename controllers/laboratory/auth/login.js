const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')
const fs = require('fs')
const app = express()

// var redis = require("redis");
// var redisStore = require('connect-redis')(session);
// var redisClient = redis.createClient();

router.use(express.static(__dirname + '/public')) //make public folder accessible publicly

const privateKey = fs.readFileSync('./private.key')

const Laboratory = require('../../../models/Lab/Laboratory')

router.get('/', function(request, response) {
    
    if (!request.session.user) {
        var error = request.session.error;
        var success = request.session.success;
        request.session.error = ""
        request.session.success = ""
        return response.render('sign-in', { pagetitle: 'Sign In Page', error: error ? error : "", success: success ? success : "" })
    }

    return response.redirect('/laboratory/dashboard')

})

router.post('/', [body('email').notEmpty().withMessage('Email is required').bail(), body('password').notEmpty().withMessage('Password is required').bail().isLength({ min: 5, max: 24 }).withMessage('Password should be of length between 5 and 24')], function(request, response, next) {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        // return response.status(422).send({ error:  })
        request.session.error = errors.array();
        return response.redirect('/laboratory/login')
    }

    let { email, password } = request.body
    Laboratory.findOne({ email: { $regex: '^' + email.toLowerCase() + '$', $options: 'i' } }, function(err, user) {
        if (!user) {
            // return response.status(400).json({ error: "User does not exist" })
            request.session.error = [{ msg: "Account does not exist" }]
            return response.redirect('/laboratory/login')

        }

        bcrypt.compare(password, user.password, function(err, res) {
            if (res) {

                const sendUser = { email: user.email }
                // if (user.verified) {
                    const token = jwt.sign(sendUser, privateKey)
                    Laboratory.findOneAndUpdate({ email: { $regex: '^' + email.toLowerCase() + '$', $options: 'i' } }, { currentToken: token }, { new: true })
                        .then(function(user) {
                            request.session.user = user;
                            let { currentToken, name, email, _id } = user
                            if (user.verified) {
                            return response.redirect('/laboratory/dashboard')
                            }
                            else{
                             request.session.state = [{ msg: "Unverified" }]
                              return response.redirect('/laboratory/login')
                               }
                                // return response.send({ user: { currentToken, name, email, email, _id } })
                        }).catch(next)

                // } else {
                //     // return response.status(400).json({ error: "User not verified yet!" })
                //     request.session.error = [{ msg: "User not verified yet!" }]
                //     return response.redirect('/laboratory/login')

                // }
            } else {
                // return response.status(400).json({ error: "Incorrect Password" })
                request.session.error = [{ msg: "Incorrect Password!" }]
                return response.redirect('/laboratory/login')

            }
        })
    }).catch(next)

    router.get('/logout', function(request, response) {
        request.session.destroy(function(err){  
            if(err){  
                console.log(err);  
            }  
            else  
            {  
                return response.redirect('/laboratory/login')
            }  
        });  
    
        
    
    })
})

module.exports = router