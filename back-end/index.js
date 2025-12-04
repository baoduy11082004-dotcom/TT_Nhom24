const express = require('express');
const cors = require('cors');
// Import file db để nó chạy lệnh kiểm tra kết nối (đã viết trong db.js)
require('./config/db'); 

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// --- CÁC ROUTE API ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));

// 👇 DÒNG QUAN TRỌNG BẠN ĐANG THIẾU 👇
// Dòng này giúp Server hiểu đường dẫn http://localhost:5000/api/leave/...
app.use('/api/leave', require('./routes/leave')); 


// Route test trang chủ
app.get('/', (req, res) => {
    res.send('API Backend đang chạy với MySQL...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại port ${PORT}`));