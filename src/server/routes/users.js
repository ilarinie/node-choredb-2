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
                var responseObject = addPurchasesAndTasksToUsers(tasks, purchases, users);
                responder.handleResponse(res, 200, "User list provided.", responseObject);
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


addPurchasesAndTasksToUsers = (tasks, purchases, users) => {
    for (let i = 0; i < tasks.length; i++){
        for (let j = 0; j < users.length; j++){
            users[j].tasks ? "" : users[j].tasks = [] ;
            if (tasks[i].user_id === users[j].user_id){
                users[j].tasks.push(tasks[i]);
                j+=100;
            }
        }
    }
    for (let i = 0; i < purchases.length; i++){
        for (let j = 0; j < users.length; j++){
            users[j].purchases ? "" : users[j].purchases = [] ;
            if (purchases[i].user_id === users[j].user_id){
                users[j].purchases.push(purchases[i]);
                j+=100;
            }
        }
    }
    for (let i = 0; i < users.length; i++){
        users[i].tasks ? "" : users[i].tasks = [];
        users[i].purchases ? "" : users[i].purchases = [];
    }
    return users;
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