const dbAccess = require("./dbAccess");
const procShedHandler = {
    get:{
        allUnconfirmed: async ()=>{
            try {
                const listPS = await dbAccess({
                    type:"select",
                    query:`select * from procedure_schedule where status = "waitToConfirm"`
                })
                let clientsId =[];

                for(let i in listPS){
                    if(!(clientsId.includes(listPS[i].clients_id))){
                        clientsId.push(listPS[i].clients_id)
                    }
                }

                let clients = [];
                for(let i in clientsId){
                    const client = await dbAccess({
                        type:"select",
                        query:`select * from clients where id = ?`,
                        param:clientsId[i]
                    })
                    clients.push(client[0]);
                }
                const allprocedures = await procedures.get.all();
                return {listPS:listPS,clients:clients, procedures:allprocedures};
            } catch (error) {
                throw error;
            }
        },
        allActiveByMasterUsername: async (username)=>{
            try {
                const value = await master.get.allByUsername(username);
                let result = null;
                if(value.length>0){
                    result = dbAccess({
                        type:"select",
                        query:`select * from procedure_schedule where masters_id = ? AND status = "notComplete"`,
                        param: value[value.length-1].id
                    });
                }
                return result;
            } catch (error) {
                throw error;
            }
        }
    },
    set:{
        waitToConfirm: async (data)=>{
            try {
                await dbAccess({
                    type:"insert",
                    query: `insert OR IGNORE into clients (first_name, last_name, tg_id, tg_chat_id) values (?,?,?,?);`,
                    param:[data.client.first_name, data.client.last_name, data.client.id, data.client.chat_id]
                });
                const client_id = await dbAccess({
                    type: "select",
                    query: `select id from clients where tg_id = ?`,
                    param: data.client.id
                });
                const procedures_id = await dbAccess({
                    type: "select",
                    query: `select id from procedures where procedure_id = ?`,
                    param: data.procedure_id
                });
                
                const check = await dbAccess({
                    type:"select",
                    query: `select * from procedure_schedule where procedures_id = ? and clients_id=? and status="waitToConfirm";`,
                    param:[procedures_id[0].id, client_id[0].id]
                });
                if(check.length == 0){
                    let is_gift = 0;
                    if(data.type = "gift"){is_gift=1;}
                    await dbAccess({
                        type:"insert",
                        query:"INSERT INTO procedure_schedule (procedures_id, clients_id, is_gift, status, making_time) values (?,?,?,?,datetime('now'))",
                        param: [procedures_id[0].id, client_id[0].id, is_gift, "waitToConfirm"]
                    })
                }
            } catch (error) {
                throw error;
            }
        }
    }
}
module.exports = procShedHandler;