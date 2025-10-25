const roles = require("../BotData/roles.json");
const masterHandler = require("./Database/mastersHandler.js")
const priceList = require("../BotData/PriceList.json");
const proceduresHandler = require("./Database/proceduresHandler.js");
const botError = require("./ErrorControler.js");

async function onload(){
    console.log("Проверка ...");
    //Проверка env файла
    if(process.env.TG_TOCKEN == 0){
        throw new Error("TG_TOCKEN in .env file is empty");
    }
    if(process.env.DB_NAME == 0){
        throw new Error("DB_NAME in .env file is empty");
    }
    if(process.env.ADMIN_TG_ID == 0){
        throw new Error("ADMIN_TG_ID in .env file is empty");
    }

    try{
        await synchronize();
        console.log("Проверка выполнена, бот запущен");
    }catch(e){
        throw new Error(e)
    }
}

//Синхронизация записей roles.js и БД
//Синхронизация записей PriceList и БД
async function synchronize(){
    let usernameList = []
    try{
        for(let i in roles.Masters){//список мастеров из roles.json
            usernameList.push(roles.Masters[i].tg_username);
            await masterHandler.set.min(roles.Masters[i]);
        }

        const list = await masterHandler.get.exclusionList(usernameList)//список никнеймов которых нет в roles.json
        for(let i in list){
            await masterHandler.delete.byUsername(list[i].tg_username)//удаление несовпавших записей
        }

        for(let i in priceList.services){
            const element = priceList.services[i]
            let t = "main";
            if(element.firstVisitDiscount){
                t = "gift";
            }
            await proceduresHandler.set.min({
                title:element.title,
                description:element.description,
                price:element.price,
                type:t,
                procedure_id:element.id
            })
        }
    }catch(e){
        throw e;
    }
}

module.exports = onload;