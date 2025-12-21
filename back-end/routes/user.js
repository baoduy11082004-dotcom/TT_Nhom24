const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ==========================================
// 1. LẤY DANH SÁCH TẤT CẢ NHÂN VIÊN
// GET /api/user
// ==========================================
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
});

// ==========================================
// 2. LẤY CHI TIẾT 1 NHÂN VIÊN
// GET /api/user/:id
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ msg: "Không tìm thấy nhân viên" });
    }

    const { password, ...user } = rows[0];
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

// ==========================================
// 3. THÊM NHÂN VIÊN MỚI (Logic của bạn)
// POST /api/user
// ==========================================
router.post("/", async (req, res) => {
  // Nhận đầy đủ các trường dữ liệu như code của bạn
  const { id, name, email, password, role, team, is_hr, work_start, work_end } = req.body;

  // 1. Validate dữ liệu cơ bản
  if (!id || !password || !name) {
    return res
      .status(400)
      .json({ msg: "Vui lòng nhập đầy đủ thông tin (ID, Tên, Mật khẩu)." });
  }

  try {
    // 2. [QUAN TRỌNG] Kiểm tra xem ID hoặc Email đã có trong DB chưa?
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE id = ? OR email = ?",
      [id, email]
    );

    if (existingUser.length > 0) {
      // Logic báo lỗi cụ thể
      const isIdDup = existingUser.some((u) => u.id === id);
      const msg = isIdDup
        ? `Mã nhân viên '${id}' đã tồn tại!`
        : `Email '${email}' đã được sử dụng!`;

      return res.status(400).json({ msg: msg });
    }

    // 3. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Lưu vào Database (Đầy đủ trường)
    await db.execute(
      `INSERT INTO users (id, name, email, password, role, team_id, is_hr, work_start, work_end, image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        email, // Sử dụng email từ form gửi lên
        hashedPassword,
        role,
        team || "dev",
        is_hr ? 1 : 0,
        work_start || "08:00",
        work_end || "17:00",
        "/placeholder-user.jpg",
      ]
    );

    res.status(201).json({ msg: "Thêm nhân viên thành công!" });
  } catch (err) {
    console.error("Lỗi thêm nhân viên:", err.message);
    res.status(500).send("Lỗi Server: " + err.message);
  }
});

// ==========================================
// 4. CẬP NHẬT THÔNG TIN NHÂN VIÊN
// PUT /api/user/:id
// ==========================================
router.put("/:id", async (req, res) => {
  const { name, role, team, work_start, work_end } = req.body;
  try {
    await db.execute(
      `UPDATE users SET name = ?, role = ?, team_id = ?, work_start = ?, work_end = ? WHERE id = ?`,
      [name, role, team, work_start, work_end, req.params.id]
    );
    res.json({ msg: "Cập nhật thông tin thành công" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
});

// ==========================================
// 5. XÓA NHÂN VIÊN
// DELETE /api/user/:id
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    await db.execute("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ msg: "Đã xóa nhân viên" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
});

module.exports = router;