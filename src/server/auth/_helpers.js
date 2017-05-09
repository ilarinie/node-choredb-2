const bcrypt = require('bcryptjs');
const knex = require('../db/connection');
const jwt = require('jsonwebtoken');
const globals = require('../globals');

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

function loginRequired(req, res, next) {
  if (!req.user) return res.status(401).json({status: 'Please log in'});
  return next();
}

function authenticate(res, username, password) {
  knex('users').where('username', username).first()
  .then((user) => {
    if (!user) {
      res.status(401).json( {message: "Auth failure :("});
      return;
    }
    if (!comparePass(password, user.password)){
      res.status(401).json( {message: "Auth2 failure "});
      return;
    }
    var payload = {
      id: user.id,
      expiry: Math.floor(new Date().getTime() + globals.JTW_TOKEN_TTL_HOURS * 60 * 60 * 1000)//7*24*60*60;
    };
    var token = jwt.sign(payload, process.env.SECRET_KEY);
    res.status(200).json( { message: "Succesfully authenticated.", token: token});
  });
}


function createUser (req) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  return knex('users')
  .insert({
    username: req.body.username,
    password: hash
  })
  .returning('*');
}

module.exports = {
  comparePass,
  loginRequired,
  authenticate,
  createUser
};
