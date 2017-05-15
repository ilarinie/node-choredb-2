const express = require('express');
const router = express.Router();
const knex = require('../db/connection');
const jwt = require('jsonwebtoken');

const authHelpers = require('../auth/_helpers');
const passport = require('../auth/jwt');

router.post('/register', (req, res, next) => {
    return authHelpers.createUser(req, res)
        .then((response) => {
            handleResponse(res, 200, "User created, you can now log in");
        })
        .catch((err) => {
            handleError(res, 500, err.toString);
        });
});

router.post('/login', (req, res) => {
    if (req.body.username && req.body.password) {
        authHelpers.authenticate(res, req.body.username, req.body.password);
    } else {
        handleError(res, 401, "You must provide valid credentials.");
    }

});

router.get('/validate_token', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    handleResponse(res, 200, "Token valid.");
});

router.post('/change_password', passport.authenticate('jwt', {session: false}), function(req, res) {
  if (req.body.password || req.user) {
    return authHelpers.changePassword(req, res, req.body.password)
                .then((response) => {
                  handleResponse(res, 200, "Password changed succesfully");
                }).catch((err) => {
                  handleError(res, 500, err.toString);
                })
  } else {
    handleError(res, 406, "Bad Request");
  }
});

function handleError(res, code, errorMsg) {
  res.status(code).json({
    message: errorMsg
  });
}

function handleResponse(res, code, statusMsg, contents) {
    res.status(code).json({
        message: statusMsg,
        contents: JSON.stringify(contents)
    });
}

module.exports = router;
