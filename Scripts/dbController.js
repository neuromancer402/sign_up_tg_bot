import { createRequire} from 'module';
const require = createRequire(import.meta.url);

//возвращает список мастеров
export const getExclusionListOfMasters = (array) => {
    let str = JSON.stringify(array);
    str = str.substring(1,str.length-1);
    return accessing({
        type:"select",
        query:`select tg_username from masters WHERE tg_username NOT IN `+"("+str+")"
    });
}

export const addMaster = (data) => {
    return accessing({
        type:"insert",
        query:`INSERT OR IGNORE INTO masters (tg_username, name) VALUES (?,?)`,
        param:[data.tg_username, data.name]
    });
}

//удалить строку в masters
export const deleteMaster = (username) =>{
    return accessing({
        type:"delete",
        query:`DELETE FROM masters WHERE tg_username = '${username}'`,
    });
}

//добавить строку в таблицу маcтеров
export const setMaster = (a) => {
    return accessing(
        `INSERT INTO masters (tg_username, name) VALUES (a.tg_username, a)`,
        "insert"
    )
}

export const checkClient = (id) =>{
    return accessing({
        type:"select",
        query:`select * from clients where tg_id = ?`,
        param:id
    });
}

export const checkMaster = (id) =>{
    return accessing({
        type:"select",
        query:`select tg_chat_id from masters where tg_id = ?`,
        param:id
    }); 
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

//Создание записи в БД об услуге, на которую решил записаться клиент
export const createSignUp = (data)=>{
    console.log(data.userid+"_"+data.selectServiceTitle+"_"+data.selectServiceType)
    return accessing(
        `INSERT INTO ...`, 
        "insert",
        data.userid
    );
}

function runQuery(data){
    return new Promise((resolve, reject)=>{
        try{
            data.DataBase.run(data.query, data.param, (err)=>{
            if(err){
                reject(err);
            }
            resolve();
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
                tg_id text,
                tg_username text UNIQUE,
                tg_chat_id text,
                name text not null
            );

            create table IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name text not null,
                tg_id text not null,
                tg_chat_id text,
                phone_num text
            );
            
            create table IF NOT EXISTS procedures (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title text not null,
                making_time text not null
            );

            create table IF NOT EXISTS procedure_schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
				procedures_id INTEGER,
				clients_id INTEGER,
				masters_id INTEGER,
				is_gift INTEGER NOT NULL DEFAULT 0,
                status text not null,
                row_create_datetime text not null,
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