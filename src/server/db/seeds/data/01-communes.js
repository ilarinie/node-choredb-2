var names = ["test_commune_1", "test_commune_2", "test_commune_3", "test_commune_4", "test_commune_5"];

exports.seed = (knex, Promise) => {
  return knex('communes').del()
  .then(() => {
    var communePromises = [];
    names.forEach(function (name) {
      communePromises.push(createCommune(knex, name));
    });
    return Promise.all(communePromises);
  });
};


function createCommune(knex, name){
  return knex.table('communes').insert({
    name: name,
    telegram_channel_id: '@lehmatesti'
  });
}
