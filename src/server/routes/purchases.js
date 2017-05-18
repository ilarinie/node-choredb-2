const express = require('express');
const router = express.Router();
const passport = require('../auth/jwt');
const knex = require('../db/connection');

var responder = require('./responder');
var parsePurchases = require('../controllers/purchase');

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
        if (validatePurchase(purchase)) {
          knex('purchases').insert(purchase).then((result) => {
            responder.handleResponse(res, 200, "Purchase created.", purchase);
          });
        } else {
          responder.handleError(res, 406, validatePurchase(purchase));
        }

    } else {
        responder.handleError(res, 406, "Invalid purchase");
    }
});

router.delete('/:id', passport.authenticate('jwt', {session: false}), function(req, res) {
  var user_id = req.user.user_id;
  var purchase_id = parseInt(req.params.id);
  if (user_id && purchase_id) {
    knex('purchases').where('user_id', user_id).andWhere('purchase_id', purchase_id).first()
      .then((purchase) => {
        if (purchase && !purchase.cancelled) {
          var cancelingPurchase = {};
          cancelingPurchase.amount = purchase.amount * -1;
          cancelingPurchase.description = "Canceled: " + purchase.description;
          cancelingPurchase.user_id = purchase.user_id;
          cancelingPurchase.commune_id = purchase.commune_id;
          cancelingPurchase.cancelled = true;
          knex('purchases').insert(cancelingPurchase).then((result) => {
            knex('purchases').where('purchase_id', purchase.purchase_id).update({cancelled: true}).then((result) => {
              responder.handleResponse(res, 200, "Purchase cancelled succesfully");
            })
          }).catch((err) => {
            responder.handleError(res, 500, "Could not insert a canceling purchase.");
          });
        } else {
          responder.handleError(res, 404, "Purchase not found.");
        }
      })
  } else {
    responder.handleError(res, 406, "Bad request");
  }
});

router.get('/', passport.authenticate('jwt', {session: false}), function(req, res) {
  var commune_id = parseInt(req.user.commune_id);
  if ( commune_id ) {
    // This threw error when selecting columns, so parsed after db query.
    return knex.raw('SELECT users.username, purchases.cancelled, purchases.purchase_id, purchases.amount, purchases.description, purchases.user_id, purchases.created_at' +
                    ' FROM purchases' +
                    ' LEFT JOIN users on users.user_id = purchases.user_id ' +
                    ' WHERE users.commune_id = ' + commune_id +
                    ' ORDER BY purchases.purchase_id DESC;').then((result) => {
                      responder.handleResponse(res, 200, "List of purchases provided.", result.rows);
                    }).catch((err) => {
                      console.log(err);
                      responder.handleError(res, 500, "Database error");
                    })

  } else {
    responder.handleError(res, 406, "Bad Request.");
  }


});



validatePurchase = (purchase) => {
  if (!purchase.amount || isNaN(parseDouble(purchase.amount)) ){
    return "Purchase is missing a proper amount.";
  }
  if (purchase.amount < 0){
    return "Purchase amount is negative.";
  }
  if (purchase.amount > 99999 ){
    return "Purchase amount too high.";
  }
  if (!purchase.description || purchase.description.length > 100 || purchase.descripion.length < 2){
    return "Purchase description missing or too long.";
  }
  if (!purchase.user_id){
    return "User id missing.";
  }
  if (!purchase.commune_id) {
    return "Commune ID missing.";
  }
  return true;
}


module.exports = router;
