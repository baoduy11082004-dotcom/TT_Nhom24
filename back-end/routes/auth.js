const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Import kết nối DB

// API Đăng nhập
router.post('/login', async (req, res) => {
  console.log("--> Nhận request Login:", req.body.email || req.body.username);

  const { email, password, role } = req.body;

  try {
    // 1. Kiểm tra gửi thiếu dữ liệu
    if (!email || !password) {
      return res.status(400).json({ msg: 'Vui lòng nhập đủ Email và Mật khẩu' });
    }

    // 2. Query Database
    // Lưu ý: Kết quả trả về của mysql2 là [rows, fields]
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    // 3. Kiểm tra user tồn tại
    if (rows.length === 0) {
      console.log("--> Lỗi: Email không tồn tại");
      return res.status(400).json({ msg: 'Email không tồn tại trong hệ thống' });
    }

    const user = rows[0];

    // 4. Kiểm tra quyền (Nếu đăng nhập tab HR)
    if (role === 'hr' && !user.is_hr) {
        console.log("--> Lỗi: Không có quyền HR");
        return res.status(403).json({ msg: 'Tài khoản không có quyền quản trị' });
    }

    // 5. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("--> Lỗi: Sai mật khẩu");
      return res.status(400).json({ msg: 'Mật khẩu không đúng' });
    }

    // 6. Đăng nhập thành công -> Trả về Token
    console.log("--> Đăng nhập THÀNH CÔNG!");
    const payload = { user: { id: user.id, role: user.role, isHr: user.is_hr } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret_mac_dinh', // Fallback nếu quên cấu hình .env
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        const { password, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
      }
    );

  } catch (err) {
    console.error("❌ LỖI SERVER:", err);
    // QUAN TRỌNG: Trả về JSON để Frontend không bị lỗi "Unexpected token L"
    res.status(500).json({ msg: 'Lỗi hệ thống: ' + err.message });
  }
});

module.exports = router;