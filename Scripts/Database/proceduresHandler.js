const dbAccess = require("./dbAccess");
const proceduresHandler = {
    get:{
        allByProcedureId:(procedure_id)=>{
            return dbAccess({
                type:"select",
                query:`select * from procedures where procedure_id = ?;`,
                param:procedure_id
            })
        },
        all:()=>{
            return dbAccess({
                type:"select",
                query:`select * from procedures;`
            })
        }
    },
    set:{
        min: async(data)=>{
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
        }
    }
}

module.exports = proceduresHandler