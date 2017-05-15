const express = require('express');
const router = express.Router();
const passport = require('../auth/jwt');
const knex = require('../db/connection');

var responder = require('./responder');

router.post('/', passport.authenticate('jwt', {session: false}), function(req, res) {
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

router.delete('/:id', passport.authenticate('jwt', {session: false}), function(req, res) {
  var user_id = req.user.user_id;
  var purchase_id = parseInt(req.params.id);
  if (user_id && purchase_id) {
    knex('purchases').where('user_id', user_id).andWhere('purchase_id', purchase_id).first().del()
      .then((result) => {
        if (result === 1) {
          responder.handleResponse(res, 200, "Purchase deleted succesfully.");
        } else {
          responder.handleError(res, 404, "Purchase not found.");
        }
      })
  } else {
    responder.handleError(res, 406, "Bad request");
  }


});


module.exports = router;
