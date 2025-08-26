import { createRequire} from 'module';
import { Markup } from 'telegraf';
const require = createRequire(import.meta.url);

let dbHandler = null;

//создать общий обработчик для работы с БД
function createHandler(){
    dbHandler = require("./dbController");
}

//Начальный скрипт
export let start = (ctx, bot) => {
    const count = checkStartNum(ctx.message.from.username);
    count.then(value=>{
        if(value == 0){
            ctx.reply(require("./getTimeHello").getTimeHello()+ctx.message.from.first_name+'\n\n'+require("../BotData/PriceList.json").gift.proposal, 
                    Markup.inlineKeyboard([
                Markup.button.callback('Забрать подарок', 'getGiftPriceBtn'),
                Markup.button.callback('Пропустить', 'getMainPriceBtn')
            ]));
            giftPriceAction(bot, ctx);
            mainPriceAction(bot, ctx);
        }else{
            ctx.reply(require("./getTimeHello").getTimeHello()+ctx.message.from.first_name+'\n\n'+require("../BotData/PriceList.json").data)
        }
    })
}

//добавить обработчик ошибок
//возвращает записи из БД о клиенте по никнейму 
function checkStartNum(username){
    createHandler();
    const a = dbHandler.client.get.allByUsername(username)
    .then(value=>{
        return value;
    }).catch(error=>{
        console.log("бля")
        throw new Error(error.message);
    });
    return a;
}

function giftPriceAction(bot, ctx){
    bot.action('getGiftPriceBtn', () => {
        serviceBtnClick(bot, ctx);
        let markupArr = [];
        require("../BotData/PriceList.json").gift.services.forEach(element => {
            markupArr.push([
                Markup.button.callback(
                    element.title,
                    'giftServiceBtn'+markupArr.length
                )
            ])
        });
        markupArr.push([
            Markup.button.callback('Пропустить', 'getMainPriceBtn')
        ])
        return ctx.reply(require("../BotData/PriceList.json").gift.data,
        Markup.inlineKeyboard(markupArr));
    })
}

function mainPriceAction(bot, ctx){
    bot.action('getMainPriceBtn', () => {
        serviceBtnClick(bot, ctx);
        let markupArr = [];
        require("../BotData/PriceList.json").main.services.forEach(element => {
            markupArr.push([
                Markup.button.callback(
                    element.title,
                    'mainServiceBtn'+markupArr.length
                )
            ])
        });
        return ctx.reply(
            require("../BotData/PriceList.json").main.data,
            Markup.inlineKeyboard(markupArr)
        );
    })
}

function serviceBtnClick(bot, ctx){
    let a = {
        bot: null,
        ctx: ctx,
        title: null,
        type:""
    };
    bot.action(/mainServiceBtn+/, ctx=>{
        let id = ctx.match.input.substring(14);
        let title = require("../BotData/PriceList.json").main.services[id].title;
        a = {
            bot:bot,
            ctx:ctx,
            title: title,
            type:"Main"
        };
        return signUp(a);

    })
    bot.action(/giftServiceBtn+/, ctx=>{
        let id = ctx.match.input.substring(14);
        let title = require("../BotData/PriceList.json").gift.services[id].title;
        a = {
            bot:bot,
            ctx:ctx,
            title: title,
            type:"Gift",
        };
        return signUp(a);
    })
    bot.action('SignUpBtnYes',async ()=>{
        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('Подтвердить запись', 'confirmToMaster')
            ],
        ]);
        //создать запись в БД
        require("./dbController").procedure_schedule.set.waitToConfirm({
            title:a.title,
            type:a.type,
            client:{
                id:ctx.message.from.id,
                chat_id:ctx.message.chat.id,
                name:ctx.message.from.first_name
            }
        });
        //отправить мастерам запрос на запись
        const masters = await require("./dbController").master.get.all();
        masters.forEach(element => {
            if(element.tg_chat_id > 0){
                //кавычки не удалять, нужны для получения подстроки
                bot.telegram.sendMessage(
                    element.tg_chat_id, 
                    `[${ctx.message.from.first_name}](tg://user?id=${ctx.message.from.id}) хочет записаться на «${a.title}»`,
                    {
                        parse_mode: 'MarkdownV2',
                        reply_markup: keyboard.reply_markup
                    }
                );
            }
        });
    })
}

function signUp(a){
    return a.ctx.reply(a.title+'\n\nЗаписаться?',
        Markup.inlineKeyboard([
            [
            Markup.button.callback('Да', 'SignUpBtnYes'),
            Markup.button.callback('Нет', 'get'+a.type+'PriceBtn')
            ],
        ])
    )
} 