const bcrypt = require('bcryptjs');
const knex = require('../db/connection');
const jwt = require('jsonwebtoken');
const uuidV4 = require('uuid/v4');
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
      res.status(401).json( { message: "Auth failure :(" });
      return;
    }
    if (!comparePass(password, user.password)){
      res.status(401).json( { message: "Auth2 failure " });
      return;
    }
    var payload = {
      id: user.user_id,
      expiry: Math.floor(new Date().getTime() + globals.JTW_TOKEN_TTL_HOURS * 60 * 60 * 1000)//7*24*60*60;
    };
    var token = jwt.sign(payload, process.env.SECRET_KEY);
    responseJson = {};
    responseJson.message = "Succesfully authenticated";
    responseJson.contents = {token: token, user: parseUser(user)};
    res.status(200).json( responseJson );
  });
}


function parseUser(user) {
  let newUser = {};
  newUser.user_id = user.user_id;
  newUser.commune_id = user.commune_id;
  newUser.username = user.username;
  newUser.name = user.name;
  return newUser;
}



function createUser (req) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  const uuid = uuidV4();
  return knex('users')
  .insert({
    user_id: uuid,
    username: req.body.username,
    password: hash
  })
  .returning('*');
}

function changePassword(req, res, password) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);

  return knex('users').update({
    password: hash
  }).returning('*');
}

module.exports = {
  comparePass,
  loginRequired,
  authenticate,
  changePassword,
  createUser
};
