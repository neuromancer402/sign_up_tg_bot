export function start(bot, clientScript){
    bot.action("showChooseConfirmRegistrationMsg", ctx=>{
        clientScript.showChooseConfirmRegistrationMsg(ctx);
    })
}