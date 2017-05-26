const jwt = require('jsonwebtoken');


var payload_user_with_admin = {
  id: '7926eed6-5416-447a-9dc7-d01bc3875be5',
  expiry: Math.floor(new Date().getTime() + 60 * 60 * 60 * 1000)//7*24*60*60;
};
const commune_admin_token = "JWT " + jwt.sign(payload_user_with_admin, process.env.SECRET_KEY);


var payload_user_with_commune = {
  id: 'd0f6c11a-826f-43ac-a309-e52d6c6e5271',
  expiry: Math.floor(new Date().getTime() + 60 * 60 * 60 * 1000)//7*24*60*60;
};
const commune_user_token = "JWT " + jwt.sign(payload_user_with_commune, process.env.SECRET_KEY);

var payload_user_with_commune_2 = {
    id: '39924a9e-640f-4245-bfb9-e5cb2de5b049',
    expiry: Math.floor(new Date().getTime() + 60 * 60 * 60 * 1000)//7*24*60*60;
};
const commune2_user_token = "JWT " + jwt.sign(payload_user_with_commune_2, process.env.SECRET_KEY);

var payload_user_without_commune = {
  id: '51f84155-11e5-4511-92a7-4a9f8f37344e',
  expiry: Math.floor(new Date().getTime() + 60 * 60 * 60 * 1000)//7*24*60*60;
};
const user_without_commune_token = "JWT " + jwt.sign(payload_user_without_commune, process.env.SECRET_KEY);


module.exports = {
  commune_admin_token,
  commune_user_token,
  commune2_user_token,
  user_without_commune_token
}


