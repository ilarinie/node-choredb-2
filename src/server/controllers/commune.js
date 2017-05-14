const knex = require('../db/connection');

function findCommune(commune_id) {
    return knex('communes').where('commune_id', commune_id).first();
}

function findCommuneChores(commune_id) {
    return knex.raw('select chores.chore_id, chores.name, max(tasks.created_at) AS lastDone from chores left join tasks on tasks.chore_id = chores.chore_id where chores.commune_id = ' + commune_id + 'group by chores.name, chores.chore_id;').then((chores) => {
        return chores.rows;
    })

}

function findCommunePurchases(commune_id) {
    return knex.raw('SELECT users.username, communes.commune_id, sum(amount) as amount, avg(amount) FROM purchases' +
        ' RIGHT JOIN users on users.user_id = purchases.user_id' +
        ' RIGHT JOIN communes on communes.commune_id = users.commune_id' +
        ' WHERE communes.commune_id =' + commune_id + ' GROUP BY users.username, communes.commune_id;').then((result) => {
        return sortAndParsePurchases(result.rows)
    });
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
      knex.raw('UPDATE users SET commune_id = ' + commune_id + ', admin = true WHERE user_id = ' + user.user_id + ';').then(() => {
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
