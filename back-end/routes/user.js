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
    // Chỉ lấy những thông tin cần thiết để hiển thị danh sách (bỏ password)
    const [rows] = await db.execute(
      "SELECT id, name, email, role, team_id, image_url, is_hr FROM users"
    );
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
});

// ==========================================
// 2. LẤY CHI TIẾT 1 NHÂN VIÊN (MỚI THÊM)
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

    // Loại bỏ password trước khi trả về để bảo mật
    const { password, ...user } = rows[0];
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Lỗi server" });
  }
});

// ==========================================
// 3. THÊM NHÂN VIÊN MỚI
// POST /api/user
// ==========================================
router.post("/", async (req, res) => {
  const { id, name, email, password, role, team, is_hr, work_start, work_end } =
    req.body;

  // Validate dữ liệu cơ bản
  if (!id || !email || !password || !name) {
    return res
      .status(400)
      .json({ msg: "Vui lòng nhập đầy đủ thông tin bắt buộc." });
  }

  try {
    // Kiểm tra xem nhân viên đã tồn tại chưa
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE email = ? OR id = ?",
      [email, id]
    );
    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ msg: "Nhân viên (Email hoặc ID) đã tồn tại." });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Chèn vào Database
    await db.execute(
      `INSERT INTO users (id, name, email, password, role, team_id, is_hr, work_start, work_end, image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        email,
        hashedPassword,
        role,
        team || "dev", // Mặc định team dev nếu không chọn
        is_hr ? 1 : 0, // Chuyển boolean sang 1/0
        work_start || "08:00",
        work_end || "17:00",
        "/placeholder-user.jpg", // Ảnh mặc định
      ]
    );

    res.status(201).json({ msg: "Thêm nhân viên thành công!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
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
