/*const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",

  host: "127.0.0.1",

  database: "diary_db",

  password: "1234",
  port: 5432,
}); */
const { Pool } = require('pg');
let pool;
if (process.env.DATABASE_URL) {
  // ===Подключение к удаленной базе данных ===//
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Подключение к локальной базе данных
  pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'diary_db',
    password: '1234',
    port: 5432,
  });
}

pool.connect((err, client, release) => {
  if (err) {
    return console.error('Ошибка подключения к БД', err.stack);
  }

  console.log('Подключено к PostgreSQL');

  release();
});
module.exports = pool;
