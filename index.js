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
        if(ctx.message.from.id == process.env.ADMIN_TG_ID){
            //сценарий если бота запустил администратор
            ctx.reply("Привет администратор");
        }
        else if(isMaster(roles, username)){
            const master = require('./Scripts/Master/MasterScript.js')
            //сценарий если бота запустил мастер
            const startMasterScript = require("./Scripts/Master/MasterScript.js");
            await require("./Scripts/Master/masterActions.js").start(bot, startMasterScript);
            startMasterScript.master(ctx, bot);
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
        new botError(error, ctx);
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

//bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
//bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))