const express = require('express');
const router = express.Router();
const db = require('../config/db');

console.log("✅ User Routes (Updated) đã được nạp.");

// 1. API: Lấy thông tin chi tiết (GET)
router.get('/profile/:id', async (req, res) => {
  try {
    // Lấy đầy đủ phone và bio từ DB
    const query = `
      SELECT id, name, email, role, image_url, team_id, is_hr, phone, bio, work_start, work_end
      FROM users
      WHERE id = ?
    `;
    const [rows] = await db.execute(query, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ msg: 'User không tồn tại' });
    
    const user = rows[0];
    res.json(user);
  } catch (err) {
    console.error("❌ Lỗi lấy profile:", err);
    res.status(500).json({ msg: err.message });
  }
});

// 2. API: Cập nhật thông tin (PUT)
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  
  // Nhận dữ liệu từ Frontend gửi lên
  const { name, email, role, image_url, imageURL, phone, bio, team, department } = req.body;
  
  // Xử lý ảnh (ưu tiên ảnh mới)
  const uploadedImage = image_url || imageURL;

  console.log(`📡 Đang update User [${id}]...`);
  console.log("   - Phone:", phone);
  console.log("   - Bio:", bio);

  try {
    // A. Lấy dữ liệu cũ để đối chiếu
    const [currentRows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    if (currentRows.length === 0) return res.status(404).json({ msg: "User không tồn tại" });
    const currentUser = currentRows[0];

    // B. Chuẩn bị dữ liệu (Nếu không gửi cái mới thì giữ nguyên cái cũ)
    const finalName = name !== undefined ? name : currentUser.name;
    const finalEmail = email !== undefined ? email : currentUser.email;
    const finalImage = (uploadedImage && uploadedImage !== "") ? uploadedImage : currentUser.image_url;
    const finalPhone = phone !== undefined ? phone : currentUser.phone; // Quan trọng
    const finalBio = bio !== undefined ? bio : currentUser.bio;       // Quan trọng
    
    // Xử lý team_id (Lưu ý: Frontend gửi 'department' hoặc 'team', Backend lưu vào 'team_id')
    const finalTeamId = team || currentUser.team_id; 

    // C. CÂU LỆNH SQL UPDATE (Đã bổ sung phone, bio)
    const query = `
        UPDATE users 
        SET 
            name = ?, 
            email = ?, 
            image_url = ?, 
            phone = ?, 
            bio = ?, 
            team_id = ?
        WHERE id = ?
    `;

    await db.execute(query, [
        finalName, 
        finalEmail, 
        finalImage, 
        finalPhone, 
        finalBio, 
        finalTeamId, 
        id
    ]);

    console.log("✅ Update Database thành công!");

    // Trả về dữ liệu mới nhất
    const [updatedRows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    res.json({ msg: 'Success', user: updatedRows[0] });

  } catch (err) {
    console.error("❌ LỖI UPDATE:", err.message);
    res.status(500).json({ msg: "Lỗi Server: " + err.message });
  }
});

// API phụ: Lấy danh sách users
router.get('/users', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM users");
        res.json(rows);
    } catch (err) { res.status(500).json({ msg: err.message }); }
});
// ... (các code cũ giữ nguyên)

// ==================================================================
// 3. API: Thêm nhân viên mới (POST)
// ==================================================================
const bcrypt = require('bcryptjs'); // Đảm bảo đã import bcryptjs ở đầu file nếu chưa có

router.post('/create', async (req, res) => {
  const { name, email, phone, role, team_id, image_url, work_start, work_end } = req.body;

  try {
    // 1. Kiểm tra email trùng
    const [exist] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (exist.length > 0) return res.status(400).json({ msg: "Email này đã tồn tại!" });

    // 2. Mã hóa mật khẩu mặc định "123456"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 3. Tạo ID mới (Ví dụ: user_timestamp)
    const newId = `user_${Date.now()}`;

    // 4. Insert vào DB
    const query = `
      INSERT INTO users (id, name, email, password, phone, role, team_id, image_url, work_start, work_end, is_hr)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `;
    
    // Mặc định: Giờ làm 08:00 - 17:30, is_hr = 0 (Nhân viên)
    await db.execute(query, [
      newId,
      name,
      email,
      hashedPassword,
      phone || "",
      role || "Nhân viên",
      team_id || "dev",
      image_url || "",
      work_start || "08:00",
      work_end || "17:30"
    ]);

    res.json({ msg: "Thêm nhân viên thành công!", user: { id: newId, name, email } });

  } catch (err) {
    console.error("Lỗi thêm user:", err);
    res.status(500).json({ msg: "Lỗi Server: " + err.message });
  }
});

// Giữ nguyên dòng này ở cuối file


module.exports = router;