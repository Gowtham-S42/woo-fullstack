import mysql from 'mysql2/promise';

export async function createPool(config) {
  const pool = mysql.createPool({
    host: config.MYSQL_HOST,
    port: Number(config.MYSQL_PORT || 3306),
    user: config.MYSQL_USER,
    password: config.MYSQL_PASSWORD,
    database: config.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10
  });
  return pool;
}
