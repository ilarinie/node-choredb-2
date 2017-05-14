const faker = require('faker');

function createChores(){
  var chores = [];
  var commune_id = 1;
  var change = 1;
  var creator_id = 1;
  for (var i = 0; i < 50 ; i++){
    var chore = {};
    chore.name =  faker.hacker.verb();
    chore.priority = faker.random.number();
    chore.points = faker.random.number();
    if (change === 6){
      commune_id++;
      if (commune_id > 5){
        commune_id = 1;
      }
      creator_id += 5;
      if (creator_id > 20) {
        creator_id = 1;
      }
      change = 1;
    }
    chore.commune_id = commune_id;
    chore.creator_id = creator_id;
    chores.push(chore);
    change++;
  }
  return chores;
}

exports.seed = (knex, Promise) => {
  return knex('chores').del()
  .then(() => {
    var chorePromises = [];
    chores = createChores();
    chores.forEach(function (chore) {
      chorePromises.push(createCommune(knex, chore));
    });
    return Promise.all(chorePromises);
  });
}


function createCommune(knex, chore){
  return knex.table('chores').insert({
    name: chore.name,
    priority: chore.priority,
    points: chore.points,
    commune_id: chore.commune_id,
    creator_id: chore.creator_id
  });
}
