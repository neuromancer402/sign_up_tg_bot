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
}