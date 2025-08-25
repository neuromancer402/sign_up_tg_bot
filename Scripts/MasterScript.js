import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function begin (ctx){
    if(getChatId(ctx) != ctx.message.chat.id){//первый запуск бота
        require("./dbController").master.set.full({
            tg_id: ctx.message.from.id,
            tg_username: ctx.message.from.username,
            tg_chat_id: ctx.message.chat.id
        }).then(()=>{
            ctx.reply(getReport(ctx));
        })
        .catch(error=>{

        })
    }else{
        ctx.reply(getReport());
    }
}
export const start = begin;

async function getReport(ctx){
    let name = "";
    require("../BotData/roles.json").Masters.forEach(element => {
        if(element.tg_username == ctx.message.from.username){
            name = element.name;
        }
    });
    const list = await require("./dbController").procedure_schedule.get.allActiveByMasterUsername(ctx.message.from.username)
    //тут обработка списка активных записей
    return sayHello(name);
}

//добавить обработчик ошибок
async function getChatId(ctx){
    const a = require("./dbController").master.get.allByUsername(ctx.message.from.username);
    a.then(value=>{
        if(value.length == 1){
            return value[0].tg_chat_id;
        }else{
            throw "Duplicate row"
        }
    }).catch(error=>{
        throw new Error(error);
    });
}

function sayHello(name){
    return require("./getTimeHello").getTimeHello()+name
}