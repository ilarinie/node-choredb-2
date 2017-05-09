const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var passportJWT = require("passport-jwt");
const authHelpers = require('./_helpers');

const init = require('./passport');
const knex = require('../db/connection');

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

init();

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'tasmanianDevil';


passport.use(new JwtStrategy(jwtOptions, (jwt_payload, next) => {

    // Check if JWT has expired
    if (new Date(jwt_payload.expiry) < new Date()){
      return next("Session expired.");
    }
    // check to see if the username exists
    knex('users').where('id', jwt_payload.id).first()
        .then((user) => {
            if (!user) {
                return next(null, false);
            } else {
                return next(null, user);
            }
        })
        .catch((err) => {
            return next(err);
        });
}));

module.exports = passport;
