const knex = require('../db/connection');
const parsePurchases = require('./purchase');


function postCommune(user, name, callBack) {
  if (user.commune_id){
    callBack("User already has a commune", null);
    return;
  }
  if (!name){
    callBack("No name given.", null);
    return;
  }
  knex('communes').insert({name: name}).returning(['commune_id', 'name']).then((asd) => {
      var commune_id = asd[0].commune_id;
      knex.raw('UPDATE users SET commune_id = ' + commune_id + ', admin = true WHERE user_id = \'' + user.user_id + '\';').then(() => {
          callBack(null, "Commune created succesfully");
      });
  }).catch((err) => {
      callBack(err.toString(), null);
  });
}

function updateCommune(commune_id, commune, callBack) {
    if (validateCommune(commune) === '') {
        knex('communes').where('commune_id', commune_id).first().update(commune).then(() => {
            callBack(null, "Commune updated successfully.")
        }).catch((err) => {
            callBack(err.toString(), null);
        })
    } else {
        callBack(validateCommune(commune), null);
    }
}

function validateCommune(commune) {
    let newCommune = commune;
    if (commune.name) {
        if (commune.name.length < 2){
            return "Commune name cant be shorter than 2 letters.";
        }
        if (commune.name.length > 30){
            return "Commune name cant be more than 30 letters.";
        }
        newCommune.name = commune.name;
    }
    if (commune.telegram_channel_id) {
        newCommune.telegram_channel_id;
    }
    commune = newCommune;
    return '';
}








module.exports = {
    postCommune,
    updateCommune
};
