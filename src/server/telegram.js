const TelegramBot = require('node-telegram-bot-api');
const token = process.env.CHOREDB_TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, {polling: false});
const knex = require('./db/connection');


sendMessage = (commune_id, message) => {
    if (process.env.NODE_ENV !== 'test') {
        knex('communes').where('commune_id', commune_id).first().then((commune) => {
            if (commune.telegram_channel_id) {
                bot.sendMessage(commune.telegram_channel_id, message);
            }
        })
    }
}


module.exports = {
    sendMessage
}