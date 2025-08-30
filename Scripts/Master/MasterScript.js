import { createRequire } from 'module';
import { Markup } from 'telegraf';
import { message } from 'telegraf/filters';

const require = createRequire(import.meta.url);
const dbController = require("../dbController");
const messageContent = require("../../BotData/messageContent.json");


function begin (ctx){
    dbController.master.set.full({
        tg_id: ctx.message.from.id,
        tg_username: ctx.message.from.username,
        tg_chat_id: ctx.message.chat.id
    }).then(async ()=>{
        try{
            ctx.reply(await getCurrentRecords(ctx));
            ctx.replyWithMarkdownV2(await getUnconfirmedRegistration(),
            Markup.inlineKeyboard([
                [
                Markup.button.callback(messageContent.master.confirmRegistration, 'showChooseConfirmRegistrationMsg')
                ]
            ]));
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
    require("../../BotData/roles.json").Masters.forEach(element => {
        if(element.tg_username == ctx.message.from.username){
            name = element.name;
        }
    });
    const list = await dbController.procedure_schedule.get.allActiveByMasterUsername(ctx.message.from.username);
    let answer = messageContent.master.noRegistration;
    
    if(list != null && list.lenth>0){
        answer = messageContent.master.haveRegistration + JSON.stringify(list);
    }
    return await sayHello(name)+"\n\n"+answer;
}

function sayHello(name){
    return require("../getTimeHello").getTimeHello()+name
}

let unconfirmedRegistrNum = 0;
let clientsAndRegistrList = {};

async function getUnconfirmedRegistration(){
    const list = await dbController.procedure_schedule.get.allUnconfirmed();
    clientsAndRegistrList = list;
    let answer = messageContent.master.haveRegistration+"\n";
    const procedures = await dbController.procedures.get.all();
    let num=0;
    list.listPS.forEach(registration => {
        for(let i in list.clients){
            if(list.clients[i].id == registration.clients_id){
                for(let j in procedures){
                    if(procedures[j].id == registration.procedures_id){
                        num++;
                        answer += `${num}\\. [${list.clients[i].first_name}](tg://user?id=${list.clients[i].tg_id}) ждет подтверждения записи на ${procedures[j].title}\n`
                    }
                }
            }
        }
    });
    unconfirmedRegistrNum = num;
    return answer;
}

export function showChooseConfirmRegistrationMsg(bot, ctx){
    let array = []
    for(let i=1;i<= unconfirmedRegistrNum;i++){
        let s = [];
        for(let j=0;j<5;j++){
            if(i<= unconfirmedRegistrNum){
                s.push(i.toString());
                i++;
            }
        }
        array.push(s);
    }
    ctx.reply("Выбор записи", Markup.keyboard(array).oneTime());
    bot.on('message', (ctx) => {
        if(!isNaN(ctx.message.text)){
            if(ctx.message.text > 0 && ctx.message.text < unconfirmedRegistrNum){
                for(let i in clientsAndRegistrList.clients){
                    if(clientsAndRegistrList.clients[i].id == clientsAndRegistrList.listPS[ctx.message.text-1].clients_id){
                        ctx.reply(clientsAndRegistrList.clients[i].last_name);
                        for(let j in clientsAndRegistrList.procedures){
                            if(clientsAndRegistrList.procedures[j].id == clientsAndRegistrList.listPS[ctx.message.text-1].procedures_id){
                                let isGift = "Нет";
                                if(clientsAndRegistrList.listPS[ctx.message.text-1].is_gift === 1){
                                    isGift = "Да";
                                }
                                ctx.replyWithMarkdownV2(
                                    `Клиент: [${clientsAndRegistrList.clients[i].first_name} ${clientsAndRegistrList.clients[i].last_name}](tg://user?id=${clientsAndRegistrList.clients[i].tg_id})`+
                                    `\nПроцедура: ${clientsAndRegistrList.procedures[j].title}`+
                                    `\nСкидка первого посещения: ${isGift}`+
                                    `\nВремя записи: `,
                                    Markup.inlineKeyboard([
                                        Markup.button.callback(messageContent.master.confirm, 'confirmRegistration'),
                                        Markup.button.callback(messageContent.master.editTime, 'editTimeRegistration')
                                    ])
                                );
                            }
                        }
                    }
                }
            }else{
                ctx.reply("Число вне диапазона");
            }
        }
    })
}