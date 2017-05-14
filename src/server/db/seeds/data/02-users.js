const bcrypt = require('bcryptjs');

var names = [
    "testUser",
    "test_user_1_2",
    "test_user_1_3",
    "test_user_1_4",
    "test_user_1_5",
    "test_user_2_1",
    "test_user_2_2",
    "test_user_2_3",
    "test_user_2_4",
    "test_user_2_5",
    "test_user_3_1",
    "test_user_3_2",
    "test_user_3_3",
    "test_user_3_4",
    "test_user_3_5",
    "test_user_4_1",
    "test_user_4_2",
    "test_user_4_3",
    "test_user_4_4",
    "test_user_4_5",
    "test_user_5_1",
    "test_user_5_2",
    "test_user_5_3",
    "test_user_5_4",
    "test_user_5_5"
];

function createUsers() {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync('testPassword', salt);


    var users = [];
    var commune_id = 1;
    var change = 1;
    for (var i = 0; i < names.length; i++){
      if (change === 6){
        commune_id++;
        change = 1;
      }
      var admin = change === 1;
      users.push({username: names[i], commune_id: commune_id, password: hash, admin: admin });
      change++;
    }
    return users;
}

exports.seed = (knex, Promise) => {
    return knex('users').del().then(() => {
        var userPromises = [];
        var users = createUsers();
        users.forEach(function(user) {
            userPromises.push(createUser(knex, user));
        });
        return Promise.all(userPromises);
    });
}

function createUser(knex, user) {
    return knex.table('users').insert({
      username: user.username,
      commune_id: user.commune_id,
      password: user.password,
      admin: user.admin
    });
}
