import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function begin (ctx){
    require("./dbController").master.set.full({
        tg_id: ctx.message.from.id,
        tg_username: ctx.message.from.username,
        tg_chat_id: ctx.message.chat.id
    }).then(async ()=>{
        try{
            const answer = await getReport(ctx);
            ctx.reply(answer);
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

async function getReport(ctx){
    let name = "";
    require("../BotData/roles.json").Masters.forEach(element => {
        if(element.tg_username == ctx.message.from.username){
            name = element.name;
        }
    });
    const list = await require("./dbController").procedure_schedule.get.allActiveByMasterUsername(ctx.message.from.username);
    let answer = "На данный момент предстоящих записей нет.";
    if(list.lenth>0){
        answer = "Список предстоящих записей:\n"+JSON.stringify(list);
    }
    return await sayHello(name)+"\n\n"+answer;
}

function sayHello(name){
    return require("./getTimeHello").getTimeHello()+name
}