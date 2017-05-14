var communes = require('./data/01-communes.js');
var users = require('./data/02-users.js');
var chores = require('./data/03-chores.js');
var purchases = require('./data/05-purchases.js');
exports.seed = function(knex, Promise) {
  return communes.seed(knex, Promise)
  .then(function () {
    return users.seed(knex, Promise);
  }).then(function() {
    return chores.seed(knex, Promise);
  }).then(function() {
    return purchases.seed(knex, Promise)
  });
}
