const express = require('express');
const router = express.Router();
const passport = require('../auth/jwt');
const knex = require('../db/connection');

const indexController = require('../controllers/index');
const communeController = require('../controllers/commune');

const jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;


router.get('/communes', passport.authenticate('jwt', {session: false}), function(req, res, next) {
    communeController.getCommune(req.user, (err, results) => {
      if (!err){
        this.handleResponse(res, 200, results);
      }
    });
});

router.post('/communes', passport.authenticate('jwt', {session: false}), function(req, res, next) {
    var user = req.user;
    communeController.postCommune(user, req.body.commune_name, (err, results) => {
      if (!err) {
        this.handleResponse(res, 200, results);
      } else {
        this.handleResponse(res, 406, err);
      }
    })
});



router.post('/chores/:id/do', passport.authenticate('jwt', {session: false}), function(req, res) {
    var id = parseInt(req.params.id);
    if (id) {
        var user_commune_id = req.user.commune_id;
        var user_id = req.user.user_id;
        knex('chores').where('chore_id', req.params.id).first().then((chore) => {
            var chore_id = chore.chore_id;
            if (chore.commune_id === user_commune_id) {
                knex('tasks').insert({user_id: user_id, chore_id: chore_id}).then((task) => {
                    res.status(200).json({lastDone: task.created_at});
                });
            } else {
                res.status(401).json();
            }
        });
    } else {
        console.log("Request without a chore id");
        res.status(403).json();
    }
});

router.post('/chores', passport.authenticate('jwt', {session: false}), function(req, res) {
    var user_id = req.user.user_id;
    var commune_id = req.user.commune_id;
    var admin = req.user.admin;
    if (admin) {
        if (req.body.name && req.body.points && req.body.priority) {
            knex('chores').insert({name: req.body.name, points_awarded: req.body.points, priority_in_minutes: req.body.priority, creator_id: user_id, commune_id: commune_id}).then((asd) => {
                res.status(200).json({message: "Chore created succesfully."});
            }).catch((err) => {
                console.log(err);
                res.status(406).json({message: err});
            });
        } else {
          res.status(406).json({message: "Data missing from request"});
        }
    } else {
        res.status(401).json({message: "You are not an admin."});
    }
});

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
        knex('purchases').insert(purchase).then((ress) => {
            res.status(200).json({message: "Purchase created.", purchase: JSON.stringify(purchase)});
        });
    } else {
        res.status(406).json({message: "Invalid purchase."})
    }
});


router.post('/communes/add_user', passport.authenticate('jwt', {session: false}), function(req, res) {
    var user_id = req.user.user_id;
    var commune_id = req.user.commune_id;
    var user_name = req.body.username;
    var admin = req.user.admin;
    if (user_id && commune_id && admin && user_name) {
        knex('users').where('username', user_name).first().then((user) => {
            if (!user) {
                res.status(406).json({message: "Username was not found"});
            } else {
                if (user.commune_id) {
                    res.status(406).json({message: "User already belongs to a commune."});
                } else {
                    knex.raw("UPDATE users SET commune_id=" + commune_id + " WHERE user_id=" + user.user_id + ";").then((result) => {
                        if (result.rowCount === 1) {
                            res.status(200).json({message: "User added succesfully."});
                        } else {
                            res.status(406).json({message: "Something went wrong adding the user."});
                        }
                    });
                }
            }
        });
    } else {
        res.status(406).json({message: "Unacceptable request."});
    }
});

handleResponse = (response, statusCode, message) => {
    response.status(statusCode).json(message);
}

module.exports = router;
