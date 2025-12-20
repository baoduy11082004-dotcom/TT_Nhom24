const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --- CẤU HÌNH THỜI GIAN ---
const WORK_START_TIME = "08:00"; // Giờ bắt đầu làm việc
const WORK_END_TIME = "17:00";   // Giờ tan làm quy định

// ==================================================
// 1. API QUÉT MÃ QR ĐỂ CHẤM CÔNG (CHECK-IN)
// POST /api/attendance/scan
// ==================================================
router.post("/scan", async (req, res) => {
  const { userId } = req.body; 

  if (!userId) {
    return res.status(400).json({ msg: "Vui lòng cung cấp mã nhân viên!" });
  }

  try {
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return res.status(404).json({ msg: "Mã QR không hợp lệ." });
    }
    const user = users[0];

    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; 
    const currentTime = now.toTimeString().split(" ")[0]; 

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

    let status = "Đúng giờ";
    if (currentTime > WORK_START_TIME + ":00") {
      status = "Đi trễ";
    }

    await db.execute(
      "INSERT INTO attendance (user_id, date, check_in_time, status) VALUES (?, ?, ?, ?)",
      [userId, currentDate, currentTime, status]
    );

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
// 2. API CHECK-OUT (TAN LÀM)
// POST /api/attendance/checkout
// ==================================================
router.post('/checkout', async (req, res) => {
    const { userId } = req.body;
    
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0]; 

    try {
        const [existing] = await db.execute(
            'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
            [userId, currentDate]
        );

        if (existing.length === 0) {
            return res.status(400).json({ msg: 'Bạn chưa Check-in hôm nay!' });
        }

        if (existing[0].check_out_time) {
            return res.status(400).json({ msg: 'Bạn đã Check-out hôm nay rồi.' });
        }

        await db.execute(
            'UPDATE attendance SET check_out_time = ? WHERE id = ?',
            [currentTime, existing[0].id]
        );

        let msg = "Check-out thành công!";
        if (currentTime < (WORK_END_TIME + ":00")) {
            msg = "Check-out thành công (Lưu ý: Bạn về sớm hơn quy định).";
        }

        res.json({ success: true, msg, checkOutTime: currentTime });

    } catch (err) {
        console.error("Lỗi Check-out:", err);
        res.status(500).json({ msg: 'Lỗi server khi Check-out.' });
    }
});

// ==================================================
// 3. API LẤY LỊCH SỬ CỦA 1 NHÂN VIÊN
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
// 4. API LẤY TOÀN BỘ LỊCH SỬ (Cho Dashboard HR)
// GET /api/attendance/all
// ==================================================
router.get("/all", async (req, res) => {
  try {
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
// 5. API CHỈNH SỬA GIỜ (UPDATE)
// PUT /api/attendance/:id
// ==================================================
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { newTime } = req.body;

  if (!newTime) {
    return res.status(400).json({ msg: "Vui lòng nhập thời gian mới." });
  }

  try {
    let status = "Đúng giờ";
    const compareTime = newTime.length === 5 ? newTime + ":00" : newTime;
    if (compareTime > WORK_START_TIME + ":00") status = "Đi trễ";

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

// ==================================================
// 6. API LẤY THỐNG KÊ DASHBOARD
// GET /api/attendance/stats/dashboard
// ==================================================
router.get("/stats/dashboard", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [totalUser] = await db.execute("SELECT COUNT(*) as count FROM users WHERE is_hr = 0");
    const [working] = await db.execute(
      "SELECT COUNT(*) as count FROM attendance WHERE date = ? AND check_in_time IS NOT NULL AND check_out_time IS NULL",
      [today]
    );
    const [late] = await db.execute(
      "SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'Đi trễ'",
      [today]
    );
    let onLeaveCount = 0;
    try {
        const [onLeave] = await db.execute(
          "SELECT COUNT(*) as count FROM leave_requests WHERE status = 'Approved' AND ? BETWEEN start_date AND end_date",
          [today]
        );
        onLeaveCount = onLeave[0].count;
    } catch (e) {}

    res.json({
      total: totalUser[0].count,
      working: working[0].count,
      late: late[0].count,
      onLeave: onLeaveCount,
    });

  } catch (error) {
    console.error("Lỗi lấy stats:", error);
    res.json({ total: 0, working: 0, late: 0, onLeave: 0 });
  }
});

// ==================================================
// 7. [MỚI] API TẠO CHẤM CÔNG THỦ CÔNG (CREATE)
// POST /api/attendance/create
// ==================================================
router.post("/create", async (req, res) => {
  const { userId, date, time } = req.body; 

  if (!userId || !date || !time) {
    return res.status(400).json({ msg: "Thiếu thông tin." });
  }

  try {
    // Kiểm tra trùng lặp
    const [existing] = await db.execute(
      "SELECT id FROM attendance WHERE user_id = ? AND date = ?",
      [userId, date]
    );

    if (existing.length > 0) {
      return res.status(400).json({ msg: "Ngày này đã có dữ liệu chấm công." });
    }

    // Tính trạng thái
    let status = "Đúng giờ";
    const compareTime = time.length === 5 ? time + ":00" : time;
    if (compareTime > WORK_START_TIME + ":00") {
      status = "Đi trễ";
    }

    // Insert
    await db.execute(
      "INSERT INTO attendance (user_id, date, check_in_time, status) VALUES (?, ?, ?, ?)",
      [userId, date, time, status]
    );

    res.json({ success: true, msg: "Đã tạo chấm công bổ sung thành công!" });

  } catch (err) {
    console.error("Lỗi tạo chấm công:", err);
    res.status(500).json({ msg: "Lỗi server." });
  }
});

module.exports = router;