const express = require('express');
const router = express.Router();
const passport = require('../auth/jwt');
const knex = require('../db/connection');

const indexController = require('../controllers/index');
const jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;



router.get('/', function (req, res, next) {
  const renderObject = {};
  renderObject.title = 'Welcome to Express!';
  indexController.sum(1, 2, (error, results) => {
    if (error) return next(error);
    if (results) {
      renderObject.sum = results;
      res.render('index', renderObject);
    }
  });
});


router.get('/communes', passport.authenticate('jwt', {
    session: false
}), function (req, res, next) {
    var commune_id = req.user.commune_id;

    var resJson = "";
    resJson = resJson + req.user;

    if (commune_id ) {
    knex('communes').where('commune_id', commune_id).first()
        .then((commune) => {
          resJson = resJson + commune
          knex.raw('select chores.chore_id, chores.name, max(tasks.task_id) AS lastDone from chores right join tasks on tasks.chore_id = chores.chore_id where chores.commune_id = ' + commune_id + 'group by chores.name, chores.chore_id;')
              .then( (chores) => {
                  resJson = resJson + chores.rows;
                  res.status(200).json(JSON.stringify(resJson));
          });
    });
  } else {
    res.status(200).json(resJson);
  }
});

router.post('/communes', passport.authenticate('jwt', {session: false}), function (req, res, next) {
  var user = req.user;
  if (user && req.body.commune_name) {
    knex('communes').insert({name: req.body.commune_name}).returning(['commune_id','name'])
        .then((asd) => {
          console.log("commune created")
          var commune_id = asd[0].commune_id;
          knex.raw('UPDATE users SET commune_id = '+commune_id+' WHERE user_id = ' + user.user_id+ ';')
              .then(() => {
                res.status(200).json({message: "Created succesfully"});
              })
        })
        .catch((err) => {
          console.log(err)
          console.log("error updates?")
          res.status(406).json({message: err});
        });
  }
});

router.post('/chores/:id/do', passport.authenticate('jwt', { session: false } ), function(req, res) {
      var id = parseInt(req.params.id);
      if (id) {
      var user_commune_id = req.user.commune_id;
      var user_id = req.user.user_id;
      knex('chores').where('chore_id', req.params.id).first()
          .then((chore) => {
            var chore_id = chore.chore_id;
            if (chore.commune_id === user_commune_id){
              knex('tasks').insert({
                user_id: user_id,
                chore_id: chore_id
              }).then((task) => {
                res.status(200).json({ lastDone: task.created_at});
              })
            }else {
              res.status(401).json();
            }
          })
    } else {
      console.log("Request without a chore id");
      res.status(403).json();
    }

})

module.exports = router;
