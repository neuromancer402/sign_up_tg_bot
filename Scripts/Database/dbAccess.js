async function dbAccess(data){
    let result = null;
    try{
        const sqlite3 = require('sqlite3').verbose();
        switch(data.type){
            case("select"):{
                const db = await readConnectDB(sqlite3);
                result = await makeSelect(db, data);
            }
            break;
            case("insert"):{
                const db = await readWriteConnectDB(sqlite3);
                result = await runQuery(db, data);
            }
            break;
            case("update"):{
                const db = await readWriteConnectDB(sqlite3);
                result = await runQuery(db, data);
            }
            break;
            case("delete"):{
                const db = await readWriteConnectDB(sqlite3);
                result = await runQuery(db, data);
            }
            break;
            default:{
                throw new Error("unknown parameter: "+data.type)
            }
        }
        return result;
    }
    catch(e){
        throw e;
    }
}
module.exports = dbAccess;

//выполнить запрос select
function makeSelect(db, data){
    return new Promise((resolve, reject)=>{
        db.all(data.query, data.param, (err, rows) =>{
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        })
    })
}

function runQuery(db, data){
    return new Promise((resolve, reject)=>{
        try{
            db.get(data.query, data.param, (err, rows)=>{
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
async function readConnectDB(sqlite3){
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