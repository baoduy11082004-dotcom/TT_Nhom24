const mysql = require("mysql2");
require("dotenv").config();

// Tạo connection pool để tái sử dụng kết nối, hiệu suất tốt hơn
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Chuyển sang promise để dùng async/await cho gọn
const promisePool = pool.promise();

console.log("Đã cấu hình kết nối MySQL...");

module.exports = promisePool;
