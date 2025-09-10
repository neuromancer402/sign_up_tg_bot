const dbAccess = require("./dbAccess");
const proceduresHandler = {
    get:{
        allByProcedureId:(procedure_id)=>{
            try {
                return dbAccess({
                    type:"select",
                    query:`select * from procedures where procedure_id = ?;`,
                    param:procedure_id
                })
            } catch (error) {
                throw error;
            }
        },
        all:()=>{
            try {
                return dbAccess({
                    type:"select",
                    query:`select * from procedures;`
                })
            } catch (error) {
                throw error;
            }
        }
    },
    set:{
        min: async(data)=>{
            try {
                await dbAccess({
                    type:"insert",
                    query:`INSERT OR IGNORE INTO procedures (title, procedure_id, description, price, type) VALUES (?,?,?,?,?);`,
                    param:[data.title, data.procedure_id, data.description, data.price, data.type]
                })
                await dbAccess({
                    type:"update",
                    query:`UPDATE OR IGNORE procedures SET description=?, price=?, type=?, title=? WHERE procedure_id = ?;`,
                    param:[data.description, data.price, data.type, data.title, data.procedure_id]
                })
                return true;
            } catch (error) {
                throw error;
            }
        }
    }
}

module.exports = proceduresHandler