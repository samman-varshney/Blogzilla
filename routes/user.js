const express = require('express');
const router = express.Router();
const User = require('../models/user')
const CatchAsync = require('../utils/catchAsync')
const passport = require('passport');
const Blog = require('../models/blog');
const Follow = require('../models/follow')
const {isLoggedIn} = require('../middleware')
const userController = require('../controller/user');
const blog = require('../models/blog');

router.get('/login', userController.loginForm)

router.get('/register', userController.registerForm)

router.post('/register', userController.register);

router.post('/login', 
    passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}),
    userController.login
)

router.get('/logout', isLoggedIn,  userController.logOut)

router.get('/users/:userId', userController.profile)

module.exports = router