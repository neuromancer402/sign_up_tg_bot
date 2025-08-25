const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')

onload();

const bot = new Telegraf(process.env.TG_TOCKEN)
bot.start((ctx) => {
    try{
        const roles = require("./BotData/roles.json")
        if(ctx.message.from.username == roles.admin || ctx.message.from.username == roles.ReserveAdmin){
            //сценарий если бота запустил администратор
            ctx.reply("Привет верховный администратор");
        }
        else if(isMaster()){
            //сценарий если бота запустил мастер
            require("./Scripts/MasterScript.js").start(ctx);
        }
        else{
            //сценарий если бота запустил клиент
            require("./Scripts/ClientScript").start(ctx, bot);
        }

        function isMaster(){
            let check = false;
            roles.Masters.forEach(element=>{
                if(element.tg_username === ctx.message.from.username){
                    check = true;
                }
            })
            return check;
        }
    }
    catch(error)
    {
        console.error(error);
        ctx.reply("В работе бота произошла ошибка, приносим свои извенения")
    }
})

//bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on(message('sticker'), (ctx) => ctx.reply('👍'))
//bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

//при запуске проверяет соответствие записей roles.js и БД
function onload(){
    let usernameList = []
    require("./BotData/roles.json").Masters.forEach(element => {//список мастеров из roles.json
        usernameList.push(element.tg_username);
        require("./Scripts/dbController").master.set.min(element);
    });
    require("./Scripts/dbController").master.get.exclusionList(usernameList)//список никнеймов которых нет в roles.json
    .then(result=>{
        result.forEach(element=>{
            require("./Scripts/dbController").master.delete.byUsername(element.tg_username)//удаление несовпавших записей
        })
    })
    .catch(err=>{
        //добавить обработчик ошибок
    })
}