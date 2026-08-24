/*const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",

  host: "127.0.0.1",

  database: "diary_db",

  password: "1234",
  port: 5432,
}); */
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Ошибка подключения к БД', err.stack);
  }

  console.log('Подключено к PostgreSQL');

  release();
});
module.exports = pool;
