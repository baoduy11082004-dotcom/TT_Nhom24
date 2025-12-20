const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --- CẤU HÌNH ---
const WORK_START_TIME = "08:00"; // Giờ bắt đầu làm việc

// ==================================================
// 1. API QUÉT MÃ QR ĐỂ CHẤM CÔNG
// POST /api/attendance/scan
// ==================================================
router.post("/scan", async (req, res) => {
  const { userId } = req.body; // Mã nhân viên nhận được từ QR

  if (!userId) {
    return res.status(400).json({ msg: "Vui lòng cung cấp mã nhân viên!" });
  }

  try {
    // Bước 1: Kiểm tra nhân viên có tồn tại trong hệ thống không
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (users.length === 0) {
      return res
        .status(404)
        .json({ msg: "Mã QR không hợp lệ (Không tìm thấy nhân viên)." });
    }
    const user = users[0];

    // Bước 2: Lấy thời gian hiện tại
    const now = new Date();
    // Lấy ngày YYYY-MM-DD
    const currentDate = now.toISOString().split("T")[0];
    // Lấy giờ HH:MM:SS
    const currentTime = now.toTimeString().split(" ")[0];

    // Bước 3: Kiểm tra xem hôm nay nhân viên này đã chấm công chưa
    const [existing] = await db.execute(
      "SELECT * FROM attendance WHERE user_id = ? AND date = ?",
      [userId, currentDate]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        msg: `Nhân viên ${user.name} đã chấm công ngày hôm nay rồi!`,
        time: existing[0].check_in_time,
      });
    }

    // Bước 4: So sánh giờ để xác định trạng thái (Đúng giờ / Trễ)
    let status = "Đúng giờ";
    // So sánh chuỗi thời gian: "08:05:00" > "08:00:00" => True
    if (currentTime > WORK_START_TIME + ":00") {
      status = "Đi trễ";
    }

    // Bước 5: Lưu thông tin vào Database
    await db.execute(
      "INSERT INTO attendance (user_id, date, check_in_time, status) VALUES (?, ?, ?, ?)",
      [userId, currentDate, currentTime, status]
    );

    // Bước 6: Trả về kết quả thành công cho Frontend
    res.json({
      success: true,
      msg: `Chấm công thành công!`,
      employee: user.name,
      time: currentTime,
      status: status,
    });
  } catch (err) {
    console.error("Lỗi chấm công:", err);
    res.status(500).json({ msg: "Lỗi server khi xử lý chấm công." });
  }
});

// ==================================================
// 2. API LẤY LỊCH SỬ CỦA 1 NHÂN VIÊN (Cho App Nhân Viên)
// GET /api/attendance/history/:userId
// ==================================================
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.execute(
      "SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC, check_in_time DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server khi lấy lịch sử." });
  }
});

// ==================================================
// 3. API LẤY TOÀN BỘ LỊCH SỬ (Cho Dashboard HR)
// GET /api/attendance/all
// ==================================================
router.get("/all", async (req, res) => {
  try {
    // Join bảng users để lấy thêm tên và avatar nhân viên
    const sql = `
            SELECT a.*, u.name as employee_name, u.image_url 
            FROM attendance a 
            JOIN users u ON a.user_id = u.id 
            ORDER BY a.date DESC, a.check_in_time DESC
        `;
    const [rows] = await db.execute(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi server khi lấy dữ liệu tổng hợp." });
  }
});

// ==================================================
// 4. API HR CHỈNH SỬA GIỜ CHẤM CÔNG
// PUT /api/attendance/:id
// ==================================================
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { newTime } = req.body; // Giờ mới (VD: "07:55")

  if (!newTime) {
    return res.status(400).json({ msg: "Vui lòng nhập thời gian mới." });
  }

  try {
    // Tự động tính lại trạng thái dựa trên giờ mới
    let status = "Đúng giờ";
    // Lưu ý: Cần đảm bảo format newTime là HH:MM hoặc HH:MM:SS
    // Nếu input là "08:05" thì cộng thêm ":00" để so sánh cho chắc nếu cần
    const compareTime = newTime.length === 5 ? newTime + ":00" : newTime;

    if (compareTime > WORK_START_TIME + ":00") {
      status = "Đi trễ";
    }

    await db.execute(
      "UPDATE attendance SET check_in_time = ?, status = ? WHERE id = ?",
      [newTime, status, id]
    );

    res.json({ msg: "Cập nhật thành công", status: status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi cập nhật dữ liệu." });
  }
});

module.exports = router;
