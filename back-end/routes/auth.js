const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const nodemailer = require('nodemailer'); // Cần cài: npm install nodemailer

// ============================================================
// CẤU HÌNH GỬI MAIL (QUAN TRỌNG: CẦN THAY THÔNG TIN CỦA BẠN)
// ============================================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ldoan263204@gmail.com", // <--- THAY EMAIL CỦA BẠN VÀO ĐÂY
    pass: "lhkjxlwlzlywelnp"      // <--- THAY MẬT KHẨU ỨNG DỤNG 16 KÝ TỰ VÀO ĐÂY
  }
});

// ============================================================
// 1. ĐĂNG NHẬP (GIỮ NGUYÊN CODE CŨ CỦA BẠN)
// POST /api/auth/login
// ============================================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Tìm user
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Tài khoản không hợp lệ' });
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
    res.status(500).json({ msg: 'Lỗi Server: ' + err.message });
  }
});

// ============================================================
// 2. QUÊN MẬT KHẨU (GỬI MAIL)
// POST /api/auth/forgot-password
// ============================================================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    // Kiểm tra email có tồn tại không
    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ msg: "Email không tồn tại trong hệ thống." });
    }

    const user = users[0];
    
    // Tạo token reset (hết hạn sau 15 phút)
    // Dùng chính user.id và JWT secret để tạo token định danh
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: "15m" });
    
    // Link reset (Frontend chạy ở port 3000)
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    // Nội dung email
    const mailOptions = {
      from: '"Hệ thống nhân sự" <no-reply@company.com>',
      to: email, // Gửi đến email người dùng nhập (hoặc Mailinator)
      subject: "Yêu cầu đặt lại mật khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #2563eb;">Xin chào ${user.name},</h2>
            <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản nhân sự.</p>
            <p>Vui lòng click vào nút dưới đây để tạo mật khẩu mới:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">ĐẶT LẠI MẬT KHẨU</a>
            </div>
            <p>Link này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: "Đã gửi email hướng dẫn! Vui lòng kiểm tra hộp thư (Check cả Spam hoặc Mailinator)." });

  } catch (err) {
    console.error("Lỗi gửi mail:", err);
    res.status(500).json({ msg: "Lỗi Server khi gửi mail: " + err.message });
  }
});

// ============================================================
// 3. ĐẶT LẠI MẬT KHẨU MỚI
// POST /api/auth/reset-password
// ============================================================
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
      return res.status(400).json({ msg: "Thiếu thông tin cần thiết." });
  }

  try {
    // Giải mã token để lấy User ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật vào DB
    await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, decoded.id]);
    
    res.json({ msg: "Đổi mật khẩu thành công! Hãy đăng nhập lại bằng mật khẩu mới." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Link không hợp lệ hoặc đã hết hạn." });
  }
});

module.exports = router;