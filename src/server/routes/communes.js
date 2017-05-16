const express = require('express');
const router = express.Router();
const passport = require('../auth/jwt');
var responder = require('./responder');
const knex = require('../db/connection');

const communeController = require('../controllers/commune');

router.get('/', passport.authenticate('jwt', {session: false}), function(req, res, next) {
    communeController.getCommune(req.user, (err, results) => {
      if (!err){
        responder.handleResponse(res, 200, "Success", results);
      } else {
        responder.handleError(res, 500, err.toString());
      }
    });
});

router.post('/', passport.authenticate('jwt', {session: false}), function(req, res, next) {
    var user = req.user;
    communeController.postCommune(user, req.body.commune_name, (err, results) => {
      if (!err) {
        responder.handleResponse(res, 200, "Success", results);
      } else {
        responder.handleError(res, 406, err.toString());
      }
    })
});

router.post('/add_user', passport.authenticate('jwt', {session: false}), function(req, res) {
    var user_id = req.user.user_id;
    var commune_id = req.user.commune_id;
    var user_name = req.body.username;
    var admin = req.user.admin;
    if (user_id && commune_id && admin && user_name) {
        knex('users').where('username', user_name).first().then((user) => {
            if (!user) {
                responder.handleError(res, 406, "Username was not found");
            } else {
                if (user.commune_id) {
                  responder.handleError(res, 406, "User already belongs to a commune.");
                } else {
                    knex.raw("UPDATE users SET commune_id=" + commune_id + " WHERE user_id='" + user.user_id + "';").then((result) => {
                        if (result.rowCount === 1) {
                            responder.handleResponse(res, 200, "User added succesfully.", result);
                        } else {
                          responder.handleError(res, 406, "Something went wrong adding the user.");
                        }
                    });
                }
            }
        });
    } else {
        responder.handleError(res, 406, "Unacceptable request.");
    }
});


module.exports = router;