const knex = require('../db/connection');

getChores = (res) => {


}

postChore = (chore, res) => {

}


deleteChore = (req, res) => {

}


updateChore = (req, res) => {

}

completeChore = (req, res, chore_id, user_id) => {
    var task = {}
    task.chore_id = chore_id;


}



parseChoreFromReq = (req) => {



}


validateChore = (chore, callBack) => {
    let newChore = chore;
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
        callBack(true, null);
    } else {
        callBack(false, errors);
    }

}

module.exports = {
    getChores,
    postChore,
    deleteChore,
    updateChore,
    validateChore
}