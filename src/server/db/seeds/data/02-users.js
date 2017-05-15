const bcrypt = require('bcryptjs');
const uuidV4 = require('uuid/v4');

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

function createSpecialUsers() {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync('1234', salt);

  var specialUsers = [];
  var user_without_commune = { username: "user_without_commune", commune_id: null, password: hash, admin: false, user_id: '51f84155-11e5-4511-92a7-4a9f8f37344e'}
  specialUsers.push(user_without_commune);

  var user_with_admin = { username: "user_with_admin", commune_id: 1, password: hash, admin: true, user_id: '7926eed6-5416-447a-9dc7-d01bc3875be5'}
specialUsers.push(user_with_admin);
  var user_normal = { username: "user_normal", commune_id: 1, password: hash, admin: false, user_id: 'd0f6c11a-826f-43ac-a309-e52d6c6e5271'}
specialUsers.push(user_normal);
  return specialUsers;
}

function createUsers() {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync('1234', salt);

    var uuid = uuidV4();
    var users = [];
    var commune_id = 1;
    var change = 1;
    for (var i = 0; i < names.length; i++){
      if (change === 6){
        commune_id++;
        change = 1;
      }
      var admin = change === 1;
      users.push({username: names[i], commune_id: commune_id, password: hash, admin: admin, user_id: uuid });
      change++;
    }
    return users;
}

exports.seed = (knex, Promise) => {
    return knex('users').del().then(() => {
        var userPromises = [];
        var specialUsers = createSpecialUsers();
        var users = createUsers();
        specialUsers.forEach(function(user) {
            userPromises.push(createUser(knex, user));
        });
        /*users.forEach(function(user) {
            userPromises.push(createUser(knex, user));
        });*/
        return Promise.all(userPromises);
    });
}

function createUser(knex, user) {
    return knex.table('users').insert({
      user_id: user.user_id,
      username: user.username,
      commune_id: user.commune_id,
      password: user.password,
      admin: user.admin
    });
}
