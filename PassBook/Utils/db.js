const pgp = require('pg-promise')({ capSQL: true });
require('dotenv').config();

const connectionInfo = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DB,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
}

const db = pgp(connectionInfo);

module.exports = {
    execute:  async (sql, param) => {
        let dbcn = null;
        try {
            dbcn = await db.connect();
            const data = await dbcn.query(sql, param);
            return data;
        } catch (error) {
            throw error;
        } finally {
            if (dbcn) {
                dbcn.done();
            }
        }
    }
}