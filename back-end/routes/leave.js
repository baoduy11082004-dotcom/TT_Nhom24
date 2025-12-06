const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Nhân viên gửi đơn -> Báo cho toàn bộ HR
router.post('/create', async (req, res) => {
  const { userId, fullName, team, startDate, endDate, reason } = req.body;
  try {
    // Lưu đơn
    await db.execute(
      `INSERT INTO leave_requests (user_id, full_name, team, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, fullName, team, startDate, endDate, reason]
    );
    
    // Báo cho HR (receiver_role='hr')
    await db.execute(
      `INSERT INTO notifications (receiver_role, message) VALUES ('hr', ?)`,
      [`Nhân viên ${fullName} (${team}) vừa gửi đơn xin nghỉ.`]
    );
    
    res.json({ msg: 'Gửi thành công' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// 2. Lấy thông báo (Lọc theo ID riêng hoặc role HR)
router.get('/notifications', async (req, res) => {
  const { role, userId } = req.query; 

  try {
    let query = '';
    let params = [];

    if (role === 'hr') {
      // HR xem thông báo chung
      query = `SELECT * FROM notifications WHERE receiver_role = 'hr' ORDER BY created_at DESC`;
    } else {
      // Nhân viên xem thông báo riêng (dựa vào receiver_id)
      query = `SELECT * FROM notifications WHERE receiver_id = ? ORDER BY created_at DESC`;
      params = [userId];
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// 3. Lấy tất cả đơn (Cho trang Duyệt của HR)
router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM leave_requests ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// 4. [QUAN TRỌNG] HR Duyệt/Từ chối -> Báo lại CHI TIẾT cho nhân viên
router.put('/update/:id', async (req, res) => {
  const { status } = req.body; 
  const { id } = req.params; // ID của đơn xin nghỉ

  try {
    // A. Cập nhật trạng thái đơn trong database
    await db.execute(`UPDATE leave_requests SET status = ? WHERE id = ?`, [status, id]);
    
    // B. Lấy thông tin chi tiết của đơn đó (Ngày bắt đầu, Kết thúc, User ID)
    const [rows] = await db.execute(
        `SELECT user_id, start_date, end_date FROM leave_requests WHERE id = ?`, 
        [id]
    );
    
    if (rows.length > 0) {
        const request = rows[0];
        
        // Format ngày cho đẹp (VD: 04/12/2025)
        const start = new Date(request.start_date).toLocaleDateString('vi-VN');
        const end = new Date(request.end_date).toLocaleDateString('vi-VN');

        // C. Tạo nội dung tin nhắn chi tiết
        let msg = "";
        if (status === 'Approved') {
            msg = `✅ TIN VUI: Đơn xin nghỉ phép (${start} - ${end}) của bạn đã được CHẤP NHẬN.`;
        } else {
            msg = `❌ THÔNG BÁO: Đơn xin nghỉ phép (${start} - ${end}) của bạn đã bị TỪ CHỐI.`;
        }
        
        // D. Gửi thông báo đích danh cho nhân viên đó
        await db.execute(
            `INSERT INTO notifications (receiver_role, receiver_id, message) VALUES ('employee', ?, ?)`,
            [request.user_id, msg]
        );
    }
    
    res.json({ msg: 'Đã xử lý và gửi thông báo chi tiết' });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ msg: err.message }); 
  }
});

// 5. Lấy danh sách ngày nghỉ ĐÃ DUYỆT (Để tô màu tím trên lịch)
router.get('/my-approved', async (req, res) => {
  const { userId } = req.query;
  try {
    const [rows] = await db.execute(
      `SELECT start_date, end_date FROM leave_requests WHERE user_id = ? AND status = 'Approved'`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;