const dbAccess = require("./dbAccess");
const clientsHandler = {
    get:{
        allByUsername: async (username)=>{
            try{
                return await dbAccess({
                    type:"select",
                    query:`select * from clients where "tg_username" = ?`,
                    param: username
                });
            }
            catch(e){
                throw e;
            }
        },
        allById: async (id)=>{
            try{
                return await dbAccess({
                    type:"select",
                    query:`select * from clients where "tg_id" = ?`,
                    param: id
                });
            }
            catch(e){
                throw e;
            }
        }
    },
    set:{
        firstNameById: async (id, first_name)=>{
            try{
                return await dbAccess({
                    type:"insert",
                    query:`update clients set first_name=? where tg_id = ?`,
                    param: [first_name, id]
                });
            }
            catch(e){
                throw e;
            }
        },
        lastNameById: async (id, last_name)=>{
            try{
                return await dbAccess({
                    type:"insert",
                    query:`update clients set last_name=? where tg_id = ?`,
                    param: [last_name, id]
                });
            }catch(e){
                throw e;
            }
        }
    }
}
module.exports = clientsHandler;