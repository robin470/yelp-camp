const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const User = require('../models/user');
const {storeReturnTo} = require('../middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo,
        passport.authenticate('local', {
            failureFlash: {type: 'error', message: 'Username or password is incorrect'},
            failureRedirect: '/login'
        }),
        users.login
    );

router.get('/logout', users.logout); 

module.exports = router;