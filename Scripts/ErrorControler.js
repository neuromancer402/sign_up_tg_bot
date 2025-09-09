class botError extends Error{
    constructor(code, status, ...params){
        super(...params);

        const { Telegraf } = require('telegraf');
        const bot = new Telegraf(process.env.TG_TOCKEN);
        const chatId = process.env.ADMIN_TG_CHAT_ID;
        bot.telegram.sendMessage(
            chatId,
            `${code}
            ${status}`
        );
        
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, botError)
        }

        this.code = code
        this.status = status
    }
}

module.exports = botError;