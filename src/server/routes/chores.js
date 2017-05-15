const express = require('express');
const router = express.Router();
const passport = require('../auth/jwt');
var responder = require('./responder');
const knex = require('../db/connection');

router.post('/:id/do', passport.authenticate('jwt', {session: false}), function(req, res) {
    var id = parseInt(req.params.id);
    if (id) {
        var user_commune_id = req.user.commune_id;
        var user_id = req.user.user_id;
        knex('chores').where('chore_id', req.params.id).first().then((chore) => {
            var chore_id = chore.chore_id;
            if (chore.commune_id === user_commune_id) {
                knex('tasks').insert({user_id: user_id, chore_id: chore_id}).then((task) => {
                    responder.handleResponse(res, 200, "Completion saved succesfully.");
                });
            } else {
                responder.handleError(res, 401, "You cant complete chores that are of another commune.")
            }
        });
    } else {
        responder.handleError(res, 406, "You need to specify a chore id.");
    }
});

router.post('/', passport.authenticate('jwt', {session: false}), function(req, res) {
    var user_id = req.user.user_id;
    var commune_id = req.user.commune_id;
    var admin = req.user.admin;
    if (admin) {
        if (req.body.name && req.body.points && req.body.priority) {
            knex('chores').insert({name: req.body.name, points: req.body.points, priority: req.body.priority, creator_id: user_id, commune_id: commune_id}).then((asd) => {
                responder.handleResponse(res, 200, "Chore created succesfully")
            }).catch((err) => {
              responder.handleError(res, 406, err.toString());
            });
        } else {
          responder.handleError(res, 406, "Data missing from request");
        }
    } else {
        responder.handleError(res, 401, "You are not an admin.");
    }
});


router.delete('/:id', passport.authenticate('jwt', {session: false}), function(req, res) {
  var user_id = req.user.user_id;
  var chore_id = parseInt(req.params.id);
  var admin = req.user.admin;
  var commune_id = req.user.commune_id;
  if (admin && user_id && chore_id && commune_id) {
    knex('chores').where('commune_id', commune_id).andWhere('chore_id', chore_id).first().del()
      .then((result) => {
        if (result === 1) {
          responder.handleResponse(res, 200, "Chore deleted succesfully.");
        } else {
          responder.handleError(res, 404, "Chore not found.");
        }
      })
  } else {
    responder.handleError(res, 406, "Bad request");
  }


});

module.exports = router;
