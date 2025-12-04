const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // 1. Tìm user
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Email không tồn tại' });
    }
    const user = rows[0];

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Mật khẩu không đúng' });
    }

    // 3. Tạo Token
    const payload = { user: { id: user.id, role: user.role, isHr: user.is_hr } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        const { password, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
      }
    );

  } catch (err) {
    console.error("❌ LỖI LOGIN:", err); 
    // QUAN TRỌNG: Trả về JSON để Frontend đọc được lỗi cụ thể
    res.status(500).json({ msg: 'Lỗi Server: ' + err.message });
  }
});

module.exports = router;