export function start(bot, clientScript){
    bot.action("showChooseConfirmRegistrationMsg", ctx=>{
        clientScript.showChooseConfirmRegistrationMsg(bot, ctx);
    })
}