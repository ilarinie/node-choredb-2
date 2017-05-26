const express = require('express');
const router = express.Router();
const passport = require('../auth/jwt');
const responder = require('./responder');
const knex = require('../db/connection');
const authHelpers = require( "../auth/_helpers");


router.get('/', passport.authenticate('jwt', {session: false}), function(req, res) {
    knex.select('username', 'name', 'user_id', 'admin').from('users').where('commune_id', req.user.commune_id).then((users) => {
        knex.select('task_id', 'user_id', 'tasks.created_at', 'tasks.chore_id', 'name').from('tasks').leftJoin('chores', 'chores.chore_id', 'tasks.chore_id').where('commune_id', req.user.commune_id).orderBy('tasks.created_at', 'DESC').then((tasks) => {
            knex.select('description', 'purchase_id', 'amount','created_at', 'user_id').from('purchases').where('commune_id', req.user.commune_id).orderBy('created_at', 'DESC').then((purchases) => {
                knex.raw("SELECT tasks.user_id, sum(points) as points FROM tasks LEFT JOIN chores ON chores.chore_id = tasks.chore_id WHERE chores.commune_id=" + req.user.commune_id + " GROUP BY tasks.user_id").then((points) => {
                    var usersJSON = addPurchasesAndTasksAndPointsToUsers(tasks, purchases,points.rows,  users);
                    responder.handleResponse(res, 200, "User list provided.", usersJSON);
                } )
            })
        });
    });
});

router.get('/profile', passport.authenticate('jwt', {session: false}), function(req, res) {
    knex.select('username', 'name', 'user_id', 'admin', 'commune_id').from('users').where('user_id', req.user.user_id).first().then((user) => {
        knex.select('task_id', 'user_id', 'tasks.created_at', 'tasks.chore_id', 'name').from('tasks').leftJoin('chores', 'chores.chore_id', 'tasks.chore_id').where('commune_id', req.user.commune_id).andWhere('user_id', req.user.user_id).orderBy('tasks.created_at', 'DESC').then((tasks) => {
            knex.select('description', 'purchase_id', 'cancelled', 'amount','created_at', 'user_id').from('purchases').where('user_id', req.user.user_id).orderBy('created_at', 'DESC').then((purchases) => {
                user.tasks = tasks;
                user.purchases = purchases;
                user.tasks ? "" : user.tasks = [];
                user.purchases ? "" : user.purchases = [];
                responder.handleResponse(res, 200, "User provided.", user);
            });
        });
    });
});


router.delete('/:user_id', passport.authenticate('jwt', {session: false}), function(req, res) {
    var id = req.params.user_id;
    if (id && req.user.admin) {
        authHelpers.removeUser(req, res, id);
    } else {
        responder.handleError(res, 406, "Unauthorized request.");
    }
});

router.put('/', passport.authenticate('jwt', {session: false}), function(req, res) {
   var user = req.body;
   user = validateUserParams(user);
   if (user.errors.length === 0){
       delete user.errors;
        knex('users').where('user_id', req.user.user_id).update(user).then((result) => {
           if (result === 1){
               responder.handleResponse(res, 200, "User updated succesfully.");
           } else {
               responder.handleError(res, 500, "Something went wrong.");
           }
        });
   } else {
       let errorString = "";
       for(let i = 0; i < user.errors.length; i++){
           errorString += errorString + user.errors[i] + "\n";
       }
       responder.handleError(res, 406, errorString);
   }

});


addPurchasesAndTasksAndPointsToUsers = (tasks, purchases, points,  users) => {
    let newTasks = tasks;
    let newPurchases = purchases;
    let newPoints = points;
    let newUsers = users;

    for (let i = 0 ; i < newUsers.length ; i++){
        newUsers[i].tasks = [];
        newUsers[i].purchases = [];
        newUsers[i].points = 0;
        for (let t = 0; t < newTasks.length; t++) {
            if (newTasks[t].user_id === newUsers[i].user_id){
                newUsers[i].tasks.push(newTasks[t]);
                newTasks.splice(t, 1);
            }
        }
        for (let p = 0; p < newPurchases.length; p++) {
            if (newPurchases[p].user_id === newUsers[i].user_id){
                newUsers[i].purchases.push(newPurchases[p]);
                newPurchases.splice(p, 1);
            }
        }
        for (let po = 0; po < newPoints.length; po++) {
            if (newPoints[po].user_id === newUsers[i].user_id){
                newUsers[i].points = newPoints[po].points;
                newPoints.splice(po,1);
            }

        }
    }
    return newUsers;
}


validateUserParams = (user) => {
    var sanitizeduser = {};
    sanitizeduser.errors = [];
    if (user.name){
        if ( user.name.length > 1 && user.name.length < 30 ) {
            sanitizeduser.name = user.name;
        } else {
            sanitizeduser.errors.push("Name too short or too long.")
        }
    }
    return sanitizeduser;
}




module.exports = router;