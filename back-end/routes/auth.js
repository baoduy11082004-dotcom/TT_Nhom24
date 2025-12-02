const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// @route   POST api/auth/login
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body; // role gửi lên từ frontend: 'employee' hoặc 'hr'

  // Kiểm tra dữ liệu đầu vào
  if (!email || !password) {
    return res
      .status(400)
      .json({ msg: "Vui lòng nhập đầy đủ email và mật khẩu" });
  }

  try {
    // 1. Tìm user trong database bằng email
    // [rows] là kết quả trả về của mysql2, nó là một mảng các dòng
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ msg: "Email không tồn tại trong hệ thống" });
    }

    const user = rows[0];

    // 2. Kiểm tra quyền (Nếu đang đăng nhập tab HR mà user không phải HR)
    if (role === "hr" && !user.is_hr) {
      return res
        .status(403)
        .json({ msg: "Tài khoản này không có quyền truy cập quản trị" });
    }

    // 3. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Mật khẩu không đúng" });
    }

    // 4. Tạo Token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        isHr: user.is_hr,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        // Trả về dữ liệu user (ẩn mật khẩu)
        const { password, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
});

module.exports = router;
