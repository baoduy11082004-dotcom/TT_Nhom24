const express = require('express');
const cors = require('cors');
// Import file db để nó chạy lệnh kiểm tra kết nối
require('./config/db'); 

const app = express();

// Middleware
app.use(cors()); 

// --- QUAN TRỌNG: Tăng giới hạn dung lượng gửi lên (để upload được ảnh) ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- CÁC ROUTE API ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/leave', require('./routes/leave')); 
app.use('/api/user', require('./routes/user'));

// Route test trang chủ
app.get('/', (req, res) => {
    res.send('API Backend đang chạy với MySQL...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại port ${PORT}`));