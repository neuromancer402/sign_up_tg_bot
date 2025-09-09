const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const botError = require('./Scripts/ErrorControler.js');
const onload = require('./Scripts/onload.js');

onload();

const bot = new Telegraf(process.env.TG_TOCKEN)
bot.start(async (ctx) => {
    try{
        const roles = require("./BotData/roles.json");
        const username = ctx.message.from.username;
        if(username == roles.admin || username == roles.ReserveAdmin){
            //сценарий если бота запустил администратор
            ctx.reply("Привет верховный администратор");
        }
        else if(isMaster(roles, username)){
            //сценарий если бота запустил мастер
            const startMasterScript = require("./Scripts/Master/MasterScript.js");
            await require("./Scripts/Master/masterActions.js").start(bot, startMasterScript);
            startMasterScript.start(ctx, bot);
        }
        else{
            //сценарий если бота запустил клиент
            const startClientScript = require("./Scripts/Client/startClientScript.js");
            await require("./Scripts/Client/clientActions.js").start(bot, startClientScript);
            startClientScript.start(ctx, bot);
        }
    }
    catch(error)
    {
        console.error(error);
        ctx.reply("В работе бота произошла ошибка, приносим свои извенения")
    }
})

function isMaster(roles, username){
    let check = false;
    roles.Masters.forEach(element=>{
        if(element.tg_username === username){
            check = true;
        }
    })
    return check;
}

//Подтверждение мастером записи
bot.action('confirmToMaster', (ctx)=>{
    const string = ctx.text;
    console.log(string.substring(string.indexOf("«")+1, string.indexOf("»")));
})

//bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
//bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))