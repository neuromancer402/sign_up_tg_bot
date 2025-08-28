import { createRequire} from 'module';
const require = createRequire(import.meta.url);

export const master = {
    set:{
        min: (data) =>{
            return accessing({
                type:"insert",
                query:`INSERT OR IGNORE INTO masters (tg_username, name) VALUES (?,?);`,
                param:[data.tg_username, data.name]
            });
        },
        full: (data) =>{
            return accessing({
                type:"update",
                query:`UPDATE masters SET tg_id="${data.tg_id}",tg_chat_id="${data.tg_chat_id}" WHERE tg_username = "${data.tg_username}"`,
                param:[data.tg_username, data.name]
            });
        }
    },
    get:{
        all: async ()=>{
            return await accessing({
                type:"select",
                query:`select * from masters`
            });
        },
        allByUsername: async (username)=>{
            return await accessing({
                type:"select",
                query:`select * from masters where "tg_username" = ?`,
                param: username
            });
        },
        exclusionList: async (array)=>{//список никнеймов, которых нет в массиве
            let str = JSON.stringify(array);
            str = str.substring(1,str.length-1);
            return accessing({
                type:"select",
                query:`select tg_username from masters WHERE tg_username NOT IN `+"("+str+")"
            });
        }
    },
    delete:{
        byUsername: async (username) =>{
            return accessing({
                type:"delete",
                query:`DELETE FROM masters WHERE tg_username = '${username}'`,
            });
        }
    }
}

export const client = {
    get:{
        allByUsername: async (username)=>{
            return await accessing({
                type:"select",
                query:`select * from clients where "tg_username" = ?`,
                param: username
            });
        },
        allById: async (id)=>{
            return await accessing({
                type:"select",
                query:`select * from clients where "tg_id" = ?`,
                param: id
            });
        }
    },
    set:{
        firstNameById: async (id, first_name)=>{
            return await accessing({
                type:"insert",
                query:`update clients set first_name=? where tg_id = ?`,
                param: [first_name, id]
            })
        },
        lastNameById: async (id, last_name)=>{
            return await accessing({
                type:"insert",
                query:`update clients set last_name=? where tg_id = ?`,
                param: [last_name, id]
            })
        }
    }
}

export const procedures = {
    get:{
        allByProcedureId:(procedure_id)=>{
            return accessing({
                type:"select",
                query:`select * from procedures where procedure_id = ?;`,
                param:procedure_id
            })
        },
        all:()=>{
            return accessing({
                type:"select",
                query:`select * from procedures;`
            })
        }
    },
    set:{
        min: async(data)=>{
            return accessing({
                type:"insert",
                query:`INSERT OR IGNORE INTO procedures (title, procedure_id, description, price, type) 
                VALUES (?,?,?,?,?);`,
                param:[data.title, data.procedure_id, data.description, data.price, data.type]
            }).then(
                await accessing({
                type:"update",
                query:`UPDATE OR IGNORE procedures SET 
                description=?, price=?, type=?, title=?
                WHERE procedure_id = ?;`,
                param:[data.description, data.price, data.type, data.title, data.procedure_id]
            })
            )
        }
    }
}

export const procedure_schedule = {
    get:{
        allUnconfirmed: async ()=>{
            const listPS = await accessing({
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
                const client = await accessing({
                    type:"select",
                    query:`select * from clients where id = ?`,
                    param:clientsId[i]
                })
                clients.push(client[0]);
            }
            return {listPS:listPS,clients:clients};
        },
        allActiveByMasterUsername: async (username)=>{
            const value = await master.get.allByUsername(username);
            let result = null;
            if(value.length>0){
                result = accessing({
                    type:"select",
                    query:`select * from procedure_schedule where masters_id = ? AND status = "notComplete"`,
                    param: value[value.length-1].id
                });
            }
            return result;
        }
    },
    set:{
        waitToConfirm: async (data)=>{
            await accessing({
                type:"insert",
                query: `insert OR IGNORE into clients (first_name, last_name, tg_id, tg_chat_id) values (?,?,?,?);`,
                param:[data.client.first_name, data.client.first_name, data.client.id, data.client.chat_id]
            });
            const client_id = await accessing({
                type: "select",
                query: `select id from clients where tg_id = ?`,
                param: data.client.id
            })
            const procedures_id = await accessing({
                type: "select",
                query: `select id from procedures where procedure_id = ?`,
                param: data.procedure_id
            })
            let is_gift = 0;
            if(data.type = "gift"){is_gift=1;}
            await accessing({
                type:"insert",
                query:"INSERT INTO procedure_schedule (procedures_id, clients_id, is_gift, status, making_time) values (?,?,?,?,datetime('now'))",
                param: [procedures_id[0].id, client_id[0].id, is_gift, "waitToConfirm"]
            })
        }
    }
}

function accessing(data){
    return new Promise((resolve, reject)=>{
        try{
            const sqlite3 = require('sqlite3').verbose();
            let connection = readWriteConnectDB(sqlite3);//создание подключения к БД
            connection.then((db)=>{
                try{
                    if(data.type === "select"){
                        const queryResult = makeSelectDB({//выполнение запроса
                            DataBase: db,
                            query: data.query,
                            param: data.param
                        })

                        queryResult.then((value)=>{
                            resolve(value);
                        }).catch((err)=>{
                            throw err;
                        });
                    }
                    if(data.type === "insert"){
                        const queryResult = runQuery({//выполнение запроса
                            DataBase: db,
                            query: data.query,
                            param: data.param
                        })
                        queryResult.then((value)=>{
                            resolve(value);
                        }).catch((err)=>{
                            throw err;
                        });
                    }
                    if(data.type === "delete"){
                        try{
                            const deleteStatement = db.prepare(data.query);
                            deleteStatement.run();
                            deleteStatement.finalize();
                            resolve();
                        }
                        catch(e){
                            reject(e)
                        }
                    }
                    if(data.type === "update"){
                        try{
                            const deleteStatement = db.prepare(data.query);
                            deleteStatement.run();
                            deleteStatement.finalize();
                            resolve();
                        }
                        catch(e){
                            reject(e)
                        }
                    }
                }
                catch(e){
                    throw e;
                }
                finally{
                    //Закрытие подключения к БД
                    db.close((err) => {
                        if (err) {
                            throw err
                        }
                    });
                }
            })
            .catch((err)=>{
                throw err;
            })
        }catch(err){
            reject(err);
        }
    })
}

function runQuery(data){
    return new Promise((resolve, reject)=>{
        try{
            data.DataBase.get(data.query, data.param, (err, rows)=>{
            if(err){
                reject(err);
            }
            resolve(rows);
        })
        }catch(e){
            reject(e)
        }
    });
}

//открыть БД только для чтения
function readConnectDB(sqlite3){
    return new Promise((resolve, reject)=>{
        const dbase = new sqlite3.Database('./'+process.env.DB_NAME, sqlite3.OPEN_READ, (err) => {
            reject(err);
        });
        resolve(dbase);
    })
}

//открыть БД для чтения и записи
function readWriteConnectDB(sqlite3){
    return new Promise((resolve, reject)=>{
        try{
            const dbase = new sqlite3.Database('./'+process.env.DB_NAME);
            //создать таблицы в БД если их не существует
            createTables(dbase)
            .then(value=>{
                resolve(value);
            })
            .catch(err=>{
                reject(err)
            })
        }
        catch(err){
            reject(err)
        }
    })
}

function makeSelectDB(a){
    return new Promise((resolve, reject)=>{
        a.DataBase.all(a.query, a.param, (err, rows) =>{
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

function createTables(newdb) {
    return new Promise((resolve, reject)=>{
        try{
            const a = newdb.exec(`
            create table IF NOT EXISTS masters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tg_id INTEGER UNIQUE,
                tg_username text UNIQUE,
                tg_chat_id INTEGER,
                name text not null
            );

            create table IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name text,
                last_name text,
                tg_id INTEGER UNIQUE,
                tg_chat_id INTEGER UNIQUE,
                phone_num text
            );
            
            create table IF NOT EXISTS procedures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title text not null,
                procedure_id text not null UNIQUE,
                description text,
                price text,
                type text
            );

            create table IF NOT EXISTS procedure_schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
				procedures_id INTEGER,
				clients_id INTEGER,
				masters_id INTEGER,
				is_gift INTEGER NOT NULL DEFAULT 0,
                status text not null,
                making_time text not null,
                FOREIGN KEY (procedures_id) REFERENCES procedures(id),
                FOREIGN KEY (clients_id) REFERENCES clients(id),
                FOREIGN KEY (masters_id) REFERENCES masters(id)
			);`,
            ()  => {
                return newdb
            });
            resolve(a);
        }
        catch(e){
            reject(e);
        }
    })
}