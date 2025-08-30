export function start(bot, clientScript){
    bot.action('getGiftPriceBtn',(ctx)=>{
        clientScript.getGiftPriceBtnClick(ctx);
    })
    bot.action('getMainPriceBtn',(ctx)=>{
        clientScript.getMainPriceBtnClick(ctx);
    })
    bot.action(/mainServiceBtn+/, ctx=>{
        clientScript.showMainServiceCard(ctx);
    })
    bot.action(/giftServiceBtn+/, ctx=>{
        clientScript.showMainServiceCard(ctx);
    })
    bot.action(/giftCreateRegistration+/, ctx=>{
        clientScript.createRegistration(ctx);
    })
    bot.action(/mainCreateRegistration+/, ctx=>{
        clientScript.createRegistration(ctx);
    })
    bot.action(/chooseDate+/, ctx=>{
        const procedureId = ctx.update.callback_query.data.substring(14);
        const type = ctx.update.callback_query.data.substring(10, 14);
        clientScript.chooseDate(ctx, procedureId,  type);
    })
}