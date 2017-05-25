const express = require('express');
const router = express.Router();
const passport = require('../auth/jwt');
const responder = require('./responder');
const knex = require('../db/connection');
const telegramBot = require('../telegram');

router.get('/', passport.authenticate('jwt', {session: false}), function(req, res) {
    if(validRequest(req, false )){
        knex('chores').where('commune_id', req.user.commune_id).then((chores) => {
            // Fetch tasks corresponding to the chores
            knex.raw('SELECT users.username, chores.name, tasks.created_at, tasks.task_id, tasks.chore_id' +
                ' FROM chores' +
                ' LEFT JOIN tasks ON tasks.chore_id = chores.chore_id' +
                ' LEFT JOIN users ON tasks.user_id = users.user_id' +
                ' WHERE chores.commune_id = '+ req.user.commune_id +
                ' ORDER BY tasks.created_at DESC;').then((result) => {
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
                    telegramBot.sendMessage(req.user.commune_id, req.user.username + ' just completed ' + chore.name + '. Nicely done.');
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
        if (validateChore(chore) === '') {
                chore.creator_id = req.user.user_id;
                chore.commune_id = req.user.commune_id;
                knex('chores').returning('*').insert(chore).then((newChore) => {
                    telegramBot.sendMessage(req.user.commune_id, req.user.username + ' just created a new chore called ' + newChore[0].name);
                    responder.handleResponse(res, 200, "New chore created succesfully", newChore[0]);
                }).catch((err) => {
                    responder.handleError(res, 500, "Internal server error :(");
                });
        } else {
            responder.handleError(res, 400, validateChore(chore));
        }
    } else {
        responder.handleError(res, 400, "Bad request");
    }
});

router.put('/:id', passport.authenticate('jwt', {session: false}), function(req, res) {
    var id = parseInt(req.params.id)
   if (validRequest(req, true), id){
    var chore = parseChoreFromReq(req);
    if (validateChore(chore, false) === '') {
        knex('chores').where('chore_id', id).first().then((oldChore) => {
            if (oldChore.commune_id === req.user.commune_id) {
                knex('chores').returning('*').where('chore_id', id).update(chore).then((results) => {
                   responder.handleResponse(res, 200, "Chore updated successfully.", results)
                })
            } else {
                responder.handleError(res, 400, "Trying to update someone else's chores, are we?");
            }
        })

    } else {
        responder.handleError(res, 406, validateChore(chore));
    }
   } else {
       responder.handleError(res, 400, "Invalid request");
   }

});


router.delete('/:id', passport.authenticate('jwt', {session: false}), function(req, res) {
  var chore_id = parseInt(req.params.id);
  if (validRequest(req, true) && chore_id) {
    knex('chores').where('commune_id', req.user.commune_id).andWhere('chore_id', chore_id).first().del()
      .then((result) => {
        if (result === 1) {
          telegramBot.sendMessage(req.user.commune_id, req.user.username + ' just deleted a chore.');
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

validateChore = (chore, checkForName) => {
    chore = sanitizeChore(chore);
    if (!chore.name && checkForName) {
        return "Name is mandatory and missing.";
    } else {
        if (chore.name.length > 50){
            return "Name is too long (max 50 letters)";
        }
        if (chore.name.length < 2) {
            return "Name too short (minimum 2 letters)";
        }
    }
    if (chore.priority ){
        if (chore.priority < 0){
            return "Priority cant be negative";
        }
        if (chore.priority > 90000) {
            return "Priority cant be over 90000";
        }
    }
    if (chore.points){
        if (chore.points < 0){
            return "Points cant be negative";
        }
        if (chore.points > 90000) {
            return "Points cant be over 90000";
        }
    }

    return '';
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
    if (chore.name) {
        newChore.name = chore.name;
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
