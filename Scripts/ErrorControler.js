class botError extends Error{
    constructor(code, status, ...params){
        super(...params);
        this.code = code
        this.status = status

        if (Error.captureStackTrace) {
            console.log("a")
            Error.captureStackTrace(this, botError)
        }
        
        this.reportToAdmin()
    }
    reportToAdmin(){
        const { Telegraf } = require('telegraf');
        const bot = new Telegraf(process.env.TG_TOCKEN);
        const chatId = process.env.ADMIN_TG_ID;
        bot.telegram.sendMessage(
            chatId,
            this.code+"\n\n"+this.stack
        );
    }
}

module.exports = botError;