const knex = require('../db/connection');

function parsePurchases(purchases){

  var newPurchases = []
  for (var i = 0; i < purchases.length; i++){
    console.log(purchases[i]);
    var newPurchase = {};
    newPurchase.amount = purchases[i].amount;
    newPurchase.username = purchases[i].username;
    newPurchase.cancelled = purchases[i].cancelled;
    newPurchase.description = purchases[i].description;
    newPurchase.created_at = purchases[i].created_at;
    newPurchase.user_id = purchases[i].user_id;
    newPurchase.purchase_id = purchases[i].purchase_id;
    newPurchases.push(newPurchase);
  }
  return newPurchases;
}

module.exports = {
  parsePurchases
}
