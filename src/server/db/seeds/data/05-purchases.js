const faker = require('faker');

/*function createPurchases(){
  var first = createpurchasesForFirstCommune();
  var rest = createOtherPurchases();
  return first.concat(rest);

}
function createOtherPurchases() {
    var purchases = [];
    var user_id = 6;
    var change = 1;
    for (var i = 0; i < 50; i++) {
        var purchase = {};
        purchase.description = faker.commerce.productName();
        purchase.amount = faker.random.number();
        if (change === 6){
          user_id++;
          if (user_id > 25) {
            user_id = 6;
          }
          change = 1;
        }
        purchases.push(purchase);
    }
    return purchases;
} */

function createpurchasesForFirstCommune(){
  var purchases = [];
  for (var i = 0; i < 5; i++) {
        var purchase = {};
        purchase.description = faker.commerce.productName();
        purchase.amount = 10;
        purchase.user_id = '7926eed6-5416-447a-9dc7-d01bc3875be5';
        purchases.push(purchase);
  }

  for ( var i = 0; i < 5; i++) {
    var purchase = {};
    purchase.description = faker.commerce.productName();
    purchase.amount = 5;
    purchase.user_id = 'd0f6c11a-826f-43ac-a309-e52d6c6e5271';
    purchases.push(purchase);
  }
  return purchases;


}

exports.seed = (knex, Promise) => {
    return knex('purchases').del().then(() => {
        var purchasePromises = [];
        purchases = createpurchasesForFirstCommune();
        purchases.forEach(function(purchase) {
            purchasePromises.push(createCommune(knex, purchase));
        });
        return Promise.all(purchasePromises);
    });
}

function createCommune(knex, purchase) {
    return knex.table('purchases').insert({
      description: purchase.description,
      amount: purchase.amount,
      user_id: purchase.user_id
    });
}
