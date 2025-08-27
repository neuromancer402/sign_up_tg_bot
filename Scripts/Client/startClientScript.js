import { createRequire} from 'module';
import { Markup } from 'telegraf';
const require = createRequire(import.meta.url);
const messageContent = require("../../BotData/messageContent.json");

export let start = async (ctx) => {
    const client = await require("../dbController").client.get.allById(ctx.message.from.id);
    if(client.length>0){
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

export function showMainServiceCard(ctx){
    //подстрока без mainServiceBtn - id услуги
    const id = ctx.update.callback_query.data.substring(14);
    let service = null;
    const arr = require("../../BotData/PriceList.json").services;
    for(let key in arr){
        if(arr[key].id == id){
            service = arr[key];
            break;
        }
    }
    ctx.reply(
        `${service.title}`+
        `\n\n${service.description}`+
        `\n\nСтоимость: ${service.price} рублей`
    );
}