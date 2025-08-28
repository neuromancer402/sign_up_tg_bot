import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function begin (ctx){
    require("./dbController").master.set.full({
        tg_id: ctx.message.from.id,
        tg_username: ctx.message.from.username,
        tg_chat_id: ctx.message.chat.id
    }).then(async ()=>{
        try{
            ctx.reply(await getCurrentRecords(ctx));
            ctx.reply(await getUnconfirmedRegistration(ctx))
        }
        catch(e){
            throw e;
        }
    })
    .catch(error=>{
        ctx.reply("В работе бота произошла ошибка, приносим извинения.")
        console.error(error);
    })
}
export const start = begin;

//сообщение с текущими записями
async function getCurrentRecords(ctx){
    let name = "";
    require("../BotData/roles.json").Masters.forEach(element => {
        if(element.tg_username == ctx.message.from.username){
            name = element.name;
        }
    });
    const list = await require("./dbController").procedure_schedule.get.allActiveByMasterUsername(ctx.message.from.username);
    let answer = require("../BotData/messageContent.json").master.noRegistration;
    
    if(list != null && list.lenth>0){
        answer = require("../BotData/messageContent.json").master.haveRegistration + JSON.stringify(list);
    }
    return await sayHello(name)+"\n\n"+answer;
}

function sayHello(name){
    return require("./getTimeHello").getTimeHello()+name
}

async function getUnconfirmedRegistration(ctx){
    const list = await require("../Scripts/dbController").procedure_schedule.get.allUnconfirmed();
    let answer = require("../BotData/messageContent.json").master.haveRegistration+"\n";
    const procedures = await require("../Scripts/dbController").procedures.get.all();
    return answer;
}