const express = require('express');
const router = express.Router();
const passport = require('../auth/jwt');
const knex = require('../db/connection');

const indexController = require('../controllers/index');
const communeController = require('../controllers/commune');

var responder = require('./responder');

const jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;

router.post('/purchases', passport.authenticate('jwt', {session: false}), function(req, res) {
    var user_id = req.user.user_id;
    var commune_id = req.user.commune_id;
    var description = req.body.description;
    var amount = req.body.amount;
    if (description && amount && commune_id && user_id) {
        var purchase = {};
        purchase.description = description;
        purchase.amount = amount;
        purchase.user_id = user_id;
        purchase.commune_id = commune_id;
        knex('purchases').insert(purchase).then((result) => {
          responder.handleResponse(res, 200, "Purchase created.", purchase);
        });
    } else {
        responder.handleError(res, 406, "Invalid purchase");
    }
});


module.exports = router;
