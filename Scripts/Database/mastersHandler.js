const dbAccess = require("./dbAccess");
const masterHandler = {
    set:{
        min: async (data) =>{
            try{
                await dbAccess({
                    type:"insert",
                    query:"INSERT OR IGNORE INTO masters (tg_username, name) VALUES (?,?);",
                    param:[data.tg_username, data.name]
                })
            }
            catch(e){
                throw e
            }            
        },
        full: (data) =>{
            try{ 
                return dbAccess({
                    type:"update",
                    query:"UPDATE masters SET tg_id=?,tg_chat_id=? WHERE tg_username = ?",
                    param:[data.tg_id, data.tg_chat_id, data.tg_username]
                });
            }
            catch(e){
                throw e
            }
        }
    },
    get:{
        all: ()=>{
            try{ 
                return dbAccess({
                    type:"select",
                    query:`select * from masters`
                });
            }
            catch(e){
                throw e
            }
        },
        allByUsername: (username)=>{
            try{
                return dbAccess({
                    type:"select",
                    query:`select * from masters where "tg_username" = ?`,
                    param: username
                });
            }
            catch(e){
                throw e
            }
        },
        exclusionList: (array)=>{//список никнеймов, которых нет в массиве
            try{
                let str = JSON.stringify(array);
                str = str.substring(1,str.length-1);
                return dbAccess({
                    type:"select",
                    query:"select tg_username from masters WHERE tg_username NOT IN ("+str+")",
                });
            }
            catch(e){
                throw e
            }
        }
    },
    delete:{
        byUsername: (username) =>{
            try{
                return dbAccess({
                    type:"delete",
                    query:'DELETE FROM masters WHERE tg_username = ?',
                    param:username
                });
            }
            catch(e){
                throw e
            }
        }
    }
}
module.exports = masterHandler;