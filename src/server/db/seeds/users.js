const bcrypt = require('bcryptjs');

exports.seed = (knex, Promise) => {
  return knex('users').del()
  .then(() => {
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync('testPassword', salt);
    return Promise.join(
      knex('users').insert({
        username: 'testUser',
        password: hash
      })
    );
  });
};
