import { createRequire} from 'module';
import { Markup } from 'telegraf';
const require = createRequire(import.meta.url);
const messageContent = require("../../BotData/messageContent.json");
let bot;

export let start = async (ctx, bt) => {
    bot = bt;
    const client = await require("../dbController").client.get.allById(ctx.message.from.id);
    if(client.length==0){
        ctx.reply(
            require("../getTimeHello").getTimeHello()+` ${ctx.message.from.first_name}\n`+
            messageContent.firstVisitData.firstVisitPrewiewText,
            Markup.inlineKeyboard([
                Markup.button.callback(messageContent.firstVisitData.firstVisitPrewiewButtonsText.yes, 'getGiftPriceBtn'),
                Markup.button.callback(messageContent.firstVisitData.firstVisitPrewiewButtonsText.no, 'getMainPriceBtn')
            ])
        )
    }
    else{
        //если совпал id то проверить не изменились ли имя фамилия
        // если изменились - перезаписать
        if(client.first_name != ctx.message.from.first_name){
            await require("../dbController").client.set.firstNameById(ctx.message.from.id, ctx.message.from.first_name);
        }
        if(client.last_name != ctx.message.from.last_name){
            await require("../dbController").client.set.lastNameById(ctx.message.from.id, ctx.message.from.last_name );
        }
        getMainPriceBtnClick(ctx);
    }
}

//показать прайс услуг по скидке первого посещения
export function getGiftPriceBtnClick(ctx){
    let markupArr = [];
    const priceList = require("../../BotData/PriceList.json");
    const messageContent = require("../../BotData/messageContent.json");
    priceList.services.forEach(element => {
        if(element.firstVisitDiscount){
            markupArr.push([
                Markup.button.callback(
                    element.title+` ${element.additionalTitle}`,
                    'giftServiceBtn'+element.id
                )
            ])
        }
    });
    markupArr.push([
        Markup.button.callback(
            messageContent.firstVisitData.showMainPriceList,
            'getMainPriceBtn'
        )
    ])
    ctx.reply(
        `${priceList.firstVisitTitle}\n${priceList.firstVisitPrewiew}`,
        Markup.inlineKeyboard(markupArr)
    );
}

//показать основной прайс
export function getMainPriceBtnClick(ctx){
    let markupArr = [];
    const priceList = require("../../BotData/PriceList.json");
    const messageContent = require("../../BotData/messageContent.json");
    priceList.services.forEach(element => {
        markupArr.push([
            Markup.button.callback(
                element.title+` ${element.additionalTitle}`,
                'mainServiceBtn'+element.id
            )
        ])
    });
    ctx.reply(
        `${priceList.mainTitle}\n${priceList.mainPrewiew}`,
        Markup.inlineKeyboard(markupArr)
    );
}

//сообщение-карточка услуги с кнопками записаться и вернуться к прайс листу
export function showMainServiceCard(ctx){
    const btnName = ctx.update.callback_query.data;
    //подстрока без mainServiceBtn - id услуги
    const id = btnName.substring(14);
    let service = null;
    const arr = require("../../BotData/PriceList.json").services;
    for(let key in arr){
        if(arr[key].id == id){
            service = arr[key];
            break;
        }
    }
    if(btnName.substring(0,4) == "main"){
        ctx.reply(
            `${service.title}`+
            `\n\n${service.description}`+
            `\n\nСтоимость: ${service.price} рублей`,
            Markup.inlineKeyboard([
                [
                Markup.button.callback(messageContent.serviceCard.mainYes, 'giftCreateRegistration'+id),
                Markup.button.callback(messageContent.serviceCard.mainNo, 'getMainPriceBtn')
                ],
            ])
        );
    }
    if(btnName.substring(0,4) == "gift"){
        ctx.replyWithMarkdownV2(
            `${service.title}`+
            `\n\n${service.description}`+
            `\n\nСтоимость первого посещения: ~${service.price}~ ${service.discountPrice} рублей`,
            Markup.inlineKeyboard([
                [
                Markup.button.callback(messageContent.serviceCard.giftYes, 'mainCreateRegistration'+id),
                Markup.button.callback(messageContent.serviceCard.giftNo, 'getGiftPriceBtn')
                ]
            ])
        );
    }
}

export async function createRegistration(ctx){
    const type = ctx.update.callback_query.data.substring(0,4);
    const procedure_id = ctx.update.callback_query.data.substring(22);
    //создать запись в БД
    await require("../../Scripts/dbController").procedure_schedule.set.waitToConfirm({
        procedure_id:procedure_id,
        type:type,
        client:{
            id:ctx.update.callback_query.from.id,
            chat_id:ctx.update.callback_query.message.chat.id,
            first_name:ctx.update.callback_query.from.first_name,
            last_name:ctx.update.callback_query.from.last_name
        }
    });
    //отправить мастерам запрос на запись
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Подтвердить запись', 'confirmToMaster')
        ],
    ]);
    const masters = await require("../../Scripts/dbController").master.get.all();
    const procedure = await require("../../Scripts/dbController").procedures.get.allByProcedureId(procedure_id);
    masters.forEach(element => {
        if(element.tg_chat_id > 0){
            bot.telegram.sendMessage(
                element.tg_chat_id, 
                `[${ctx.update.callback_query.from.first_name}](tg://user?id=${ctx.update.callback_query.from.id}) хочет записаться на «${procedure[0].title}»`,
                {
                    parse_mode: 'MarkdownV2',
                    reply_markup: keyboard.reply_markup
                }
            );
        }
    });
}