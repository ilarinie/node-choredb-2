const express = require('express');
const router = express.Router();
const passport = require('../auth/jwt');
const responder = require('./responder');
const knex = require('../db/connection');


router.get('/', passport.authenticate('jwt', {session: false}), function(req, res) {
    if(validRequest(req, false )){
        knex('chores').where('commune_id', req.user.commune_id).then((chores) => {
            // Fetch tasks corresponding to the chores
            knex.raw('SELECT users.username, chores.name, tasks.created_at, tasks.task_id, tasks.chore_id' +
                ' FROM chores' +
                ' LEFT JOIN tasks ON tasks.chore_id =chores.chore_id' +
                ' LEFT JOIN users ON tasks.user_id = users.user_id' +
                ' WHERE chores.commune_id = '+ req.user.commune_id + ';').then((result) => {
                responder.handleResponse(res, 200, "Chores and tasks provided", addTasksToChores(chores, result.rows));
            }).catch((err) => {
                responder.handleError(res, 500, "Something went wrong when getting chores and tasks.");
            });
        }).catch((err) => {
            responder.handleError(res, 500, "Internal server error.");
        })
    } else {
        responder.handleError(res, 400, "Bad request.");
    }
});

router.post('/:id/do', passport.authenticate('jwt', {session: false}), function(req, res) {
    var id = parseInt(req.params.id);
    if (validRequest(req, false) && id) {
        knex('chores').where('chore_id', req.params.id).first().then((chore) => {
            var chore_id = chore.chore_id;
            if (chore.commune_id === req.user.commune_id) {
                knex('tasks').insert({user_id: req.user.user_id, chore_id: chore_id}).then((task) => {
                    responder.handleResponse(res, 200, "Completion saved succesfully.");
                });
            } else {
                responder.handleError(res, 401, "You cant complete chores that are of another commune.")
            }
        }).catch((err) => {
            responder.handleError(res, 404, "Chore not found.");
        })
    } else {
        responder.handleError(res, 406, "You need to specify a chore id.");
    }
});

router.post('/', passport.authenticate('jwt', {session: false}), function(req, res) {
    if (validRequest(req, true)) {
        var chore = parseChoreFromReq(req);
        if (chore && validateChore(chore)) {
                chore.creator_id = req.user.user_id;
                chore.commune_id = req.user.commune_id;
                knex('chores').returning('*').insert(chore).then((chore) => {
                    responder.handleResponse(res, 200, "New chore created succesfully", chore);
                }).catch((err) => {
                    responder.handleError(res, 500, "Internal server error :(");
                });
        } else {
            responder.handleError(res, 400, "Invalid chore.");
        }
    } else {
        responder.handleError(res, 400, "Bad request");
    }
});

router.put('/:id', passport.authenticate('jwt', {session: false}), function(req, res) {
    var id = parseInt(req.params.id)
   if (validRequest(req, true), id){
    var chore = parseChoreFromReq(req);
    if (chore && validateChore(chore)) {
        knex('chores').where('chore_id', id).first().then((oldChore) => {
            if (oldChore.commune_id === req.user.commune_id) {
                knex('chores').returning('*').where('chore_id', id).update(chore).then((results) => {
                   responder.handleResponse(res, 200, "Chore updated succesfully.", results)
                })
            } else {
                responder.handleError(res, 400, "Trying to update someone elses chores, are we?");
            }
        })

    }
   } else {
       responder.handleError(res, 400, "Bad Request");
   }

});


router.delete('/:id', passport.authenticate('jwt', {session: false}), function(req, res) {
  var chore_id = parseInt(req.params.id);
  if (validRequest(req, true) && chore_id) {
    knex('chores').where('commune_id', req.user.commune_id).andWhere('chore_id', chore_id).first().del()
      .then((result) => {
        if (result === 1) {
          responder.handleResponse(res, 200, "Chore deleted succesfully.");
        } else {
          responder.handleError(res, 404, "Chore not found.");
        }
      })
  } else {
      responder.handleError(res, 400, "Bad Request");
  }
});


// HELPERS

validRequest = (req, checkForAdmin) => {
    if ( checkForAdmin ){
        return (req.user.user_id && req.user.commune_id && req.user.admin);
    }
    return (typeof(req.user.user_id) !== 'undefined' && typeof(req.user.commune_id) !== 'undefined');
}


parseChoreFromReq = (req) => {
    try {
        var chore = req.body;
    } catch(err)  {
        return null;
    }
    return chore;
}

validateChore = (chore) => {
    let errors = [];
    if (!chore.name) {
        errors.push("Name is mandatory and missing.\n");
    } else {
        if (chore.name.length > 50){
            errors.push("Name is too long (max 50 letters)\n");
        }
        if (chore.name.length < 2) {
            errors.push("Name too short (minimum 2 letters)\n");
        }
    }
    if (chore.priority ){
        if (chore.priority < 0){
            errors.push("Priority cant be negative\n");
        }
        if (chore.priority > 90000) {
            errors.push("Priority cant be over 90000\n");
        }
    }
    if (chore.points){
        if (chore.points < 0){
            errors.push("Points cant be negative\n");
        }
        if (chore.points > 90000) {
            errors.push("Points cant be over 90000\n");
        }
    }
    if (errors.length === 0){
        chore = sanitizeChore(chore);
        return true;
    } else {
        chore.errors = errors;
        return false;
    }
}

sanitizeChore = (chore) => {
    let newChore = {};
    if (chore.chore_id ) {
        newChore.chore_id = chore.chore_id;
    }
    if (chore.priority){
        newChore.priority = chore.priority;
    }
    if (chore.points) {
        newChore.points = chore.points;
    }
    return newChore;
}

function addTasksToChores(chores, tasks){
    var newChores = chores;
    for (var i = 0; i < tasks.length; i++){
        for (var j = 0; j < newChores.length; j++){
            if (tasks[i].chore_id === newChores[j].chore_id){
                if (newChores[j].tasks){
                    newChores[j].tasks.push(tasks[i]);
                } else {
                    newChores[j].tasks = [];
                    newChores[j].tasks.push(tasks[i]);
                }
            }
        }
    }
    for (var i = 0; i < newChores.length; i++) {
        if (!newChores[i].tasks){
            newChores[i].tasks = [];
        }
    }
    return newChores;
}


module.exports = router;
