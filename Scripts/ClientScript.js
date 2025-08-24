import { time } from 'console';
import { createRequire} from 'module';
import { title } from 'process';
import { Markup } from 'telegraf';
const require = createRequire(import.meta.url);

let dbHandler = null; //возвращает только результаты запросов в БД
let userData = {
    id:null
}

//создать общий обработчик для работы с БД
function createHandler(){
    dbHandler = require("./dbController");
}

//Начальный скрипт
export let start = (ctx, bot) => {
    userData.id = ctx.message.from.id;
    const count = checkStartNum(ctx);
    count.then(value=>{
        if(value == 0){
            ctx.reply(require("./getTimeHello").getTimeHello()+ctx.message.from.first_name+'\n\n'+require("../BotData/PriceList.json").gift.proposal, 
                    Markup.inlineKeyboard([
                Markup.button.callback('Забрать подарок', 'getGiftPriceBtn'),
                Markup.button.callback('Пропустить', 'getMainPriceBtn')
            ]));
            giftPriceAction(bot);
            mainPriceAction(bot);
        }else{
            ctx.reply(require("./getTimeHello").getTimeHello()+ctx.message.from.first_name+'\n\n'+require("../BotData/PriceList.json").data)
        }
    })
}

//добавить обработчик ошибок
function checkStartNum(){
    createHandler();
    const a = dbHandler.checkClient(userData.id)
    .then(value=>{
        return value;
    }).catch(error=>{
        console.log("бля")
        throw new Error(error.message);
    });
    return a;
}

function giftPriceAction(bot){
    bot.action('getGiftPriceBtn', (ctx) => {
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

function mainPriceAction(bot){
    bot.action('getMainPriceBtn', (ctx) => {
        serviceBtnClick(bot);
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
    bot.action('SignUpBtnYes', ()=>{
        //отправить мастеру запрос на запись
        
        /*//создать запись в БД о неподтвержденной записи на услугу
        dbHandler.createSignUp({
            userid:userData.id,
            selectServiceTitle:a.title,
            selectServiceType:a.type
        });*/
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