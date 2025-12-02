const mysql = require('mysql2');
const path = require('path');

// --- QUAN TRỌNG: ÉP ĐƯỜNG DẪN ĐẾN FILE .ENV ---
// __dirname là thư mục 'config'
// '../.env' nghĩa là đi ra ngoài 1 cấp để tìm file .env (tức là ở thư mục back-end)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log("-----------------------------------------");
console.log("DEBUG: Đang tìm file .env tại:", path.resolve(__dirname, '../.env'));
console.log("DEBUG: DB_USER =", process.env.DB_USER); // Hy vọng sẽ thấy 'root'
console.log("DEBUG: DB_PASSWORD =", process.env.DB_PASSWORD); 
console.log("-----------------------------------------");

// Cấu hình kết nối
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',        
  password: process.env.DB_PASSWORD || '',    
  database: process.env.DB_NAME || 'quanlynhansu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

// Test kết nối ngay
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ KẾT NỐI DATABASE THẤT BẠI:", err.code);
        console.error("Lỗi chi tiết:", err.message);
    } else {
        console.log("✅ KẾT NỐI DATABASE THÀNH CÔNG!");
        connection.release();
    }
});

module.exports = promisePool;