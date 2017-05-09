const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const jwt = require('jsonwebtoken');

const authHelpers = require('../auth/_helpers');
const passport = require('../auth/local');

router.post('/register', (req, res, next) => {
    return authHelpers.createUser(req, res)
        .then((response) => {
            handleResponse(res, 200, "User created, you can now log in");
        })
        .catch((err) => {
            handleResponse(res, 500, err);
        });
});

router.post('/login', (req, res) => {
    if (req.body.username && req.body.password) {
        var username = req.body.username;
        var password = req.body.password;
    }
    if (res, username, password) {
      authHelpers.authenticate(res, username, password);
    } else {
      handleResponse(res, 401, "You must provide valid credentials.");
    }

});

router.get('/validate_token', passport.authenticate('jwt', {session: false}), function(req, res){
  handleResponse(res, 200, "Token valid.");
});



function handleResponse(res, code, statusMsg) {
    res.status(code).json({
        status: statusMsg
    });
}

module.exports = router;
