import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export let start = (ctx) => {
    getChatId(ctx);
}

//добавить обработчик ошибок
function getChatId(ctx){
    const a = require("./dbController").checkMaster(ctx.message.from.id);
    a.then(value=>{
        console.log(value);
    }).catch(error=>{
        console.error(error)
        throw new Error(error);
    });
}

function sayHello(ctx){
    return require("./getTimeHello").getTimeHello()+ctx.message.from.first_name
}