const knex = require('../db/connection');
const parsePurchases = require('./purchase');

function findCommune(commune_id) {
    return knex('communes').where('commune_id', commune_id).first();
}

function findCommuneChores(commune_id) {
    return knex.raw('SELECT DISTINCT ON (foo.chore_id) foo.username AS lastdoer, max(foo.max) AS lastdone, foo.priority, foo.points, foo.chore_id, foo.name AS chorename' +
                    ' FROM ( SELECT users.username, max(tasks.created_at), chores.chore_id, chores.name, chores.priority, chores.points FROM communes'+
                    ' LEFT JOIN chores on chores.commune_id = communes.commune_id' +
                    ' LEFT JOIN tasks on chores.chore_id = tasks.chore_id' +
                    ' LEFT JOIN users on users.user_id = tasks.user_id' +
                    ' WHERE communes.commune_id = '+ commune_id +
                    ' GROUP BY chores.chore_id, chores.name, users.username, chores.priority, chores.points ) foo' +
                    ' GROUP BY foo.username, foo.chore_id, foo.name, foo.priority, foo.points;').then((chores) => {
                      return chores.rows;
                  });
}

function findCommunePurchases(commune_id) {
    return knex.raw('SELECT users.username, purchases.cancelled, purchases.purchase_id, purchases.amount, purchases.description, purchases.user_id, purchases.created_at' +
                    ' FROM purchases' +
                    ' LEFT JOIN users on users.user_id = purchases.user_id ' +
                    ' WHERE users.commune_id = ' + commune_id +
                    ' ORDER BY purchases.purchase_id DESC;').then((result) => {
                      return result.rows;
                    })


    /*return knex.raw('SELECT users.username, communes.commune_id, sum(amount) as amount, avg(amount) FROM purchases' +
        ' RIGHT JOIN users on users.user_id = purchases.user_id' +
        ' RIGHT JOIN communes on communes.commune_id = users.commune_id' +
        ' WHERE communes.commune_id =' + commune_id + ' GROUP BY users.username, communes.commune_id;').then((result) => {
        return sortAndParsePurchases(result.rows)
    });*/
}


function sortAndParsePurchases(purchases) {
    var sum_of_all = 0;
    for (var i = 0; i < purchases.length; i++) {
        sum_of_all = sum_of_all + parseFloat(purchases[i].amount);
    }
    var average_of_all = sum_of_all / purchases.length;
    for (var i = 0; i < purchases.length; i++) {
        purchases[i].differential = purchases[i].amount - average_of_all;
    }
    purchases.sort(function(a, b) {
        return (b.differential - a.differential);
    });
    return purchases;
}


function getCommune(user, callBack) {
    var commune_id = user.commune_id;
    var resJson = {};
    var retUser = {
        user_id: user.user_id,
        username: user.username,
        name: user.name,
        admin: user.admin
    }
    resJson.user = retUser;

    if (commune_id) {
      findCommune(commune_id).then((commune) => {
          resJson.commune = commune;
          findCommuneChores(commune_id).then((chores) => {
              resJson.chores = chores;
              findCommunePurchases(commune_id).then((purchases) => {
                  resJson.purchases = purchases;
                  callBack(null, resJson);
              });
          });
      }).catch((err) => {
        callBack(err, null);
      });

    } else {
        callBack(null, resJson);
    }
}


function postCommune(user, name, callBack) {
  if (user.commune_id){
    callBack({message: "User already has a commune"}, null);
    return;
  }
  if (!name){
    callBack({message: "No name given."}, null);
    return;
  }
  knex('communes').insert({name: name}).returning(['commune_id', 'name']).then((asd) => {
      var commune_id = asd[0].commune_id;
      knex.raw('UPDATE users SET commune_id = ' + commune_id + ', admin = true WHERE user_id = \'' + user.user_id + '\';').then(() => {
          callBack(null, {message: "Commune created succesfully"});
      });
  }).catch((err) => {
      callBack(err, null);
  });
}

module.exports = {
    getCommune,
    postCommune
};
