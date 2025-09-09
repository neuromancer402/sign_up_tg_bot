const roles = require("../BotData/roles.json");
const dbController = require("./dbController.js");
const priceList = require("../BotData/PriceList.json");

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

    await synchronize();
    console.log("Проверка выполнена, бот работает");
}

//Синхронизация записей roles.js и БД
//Синхронизация записей PriceList и БД
async function synchronize(){
    let usernameList = []
    roles.Masters.forEach(element => {//список мастеров из roles.json
        usernameList.push(element.tg_username);
        dbController.master.set.min(element);
    });
    const list = await dbController.master.get.exclusionList(usernameList)//список никнеймов которых нет в roles.json
    
    for(let i in list){
        dbController.master.delete.byUsername(list[i].tg_username)//удаление несовпавших записей
    }

    for(let i in priceList.services){
        const element = priceList.services[i]
        let t = "main";
        if(element.firstVisitDiscount){
            t = "gift";
        }
        await dbController.procedures.set.min({
            title:element.title,
            description:element.description,
            price:element.price,
            type:t,
            procedure_id:element.id
        })
    }
}

module.exports = onload;