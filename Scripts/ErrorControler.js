class botError extends Error{
    constructor(code, ctx, ...params){
        super(...params);
        this.code = code;
        this.ctx = ctx;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, botError)
        }
        
        this.reportToAdmin();
        if(this.ctx > 0){
            ctx.reply("В работе бота произошла ошибка, приносим свои ивинения.\nПопробуйте перезапустить бот, вдруг это поможет (заново отправьте /start)");
        }
        console.log(code);
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