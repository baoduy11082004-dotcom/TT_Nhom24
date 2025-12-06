const express = require('express');
const router = express.Router();
const db = require('../config/db');

// @route   GET api/projects/my-projects
// @desc    Lấy danh sách dự án mà nhân viên đang tham gia
router.get('/my-projects', async (req, res) => {
  const { userId } = req.query; // Frontend sẽ gửi userId lên

  if (!userId) {
    return res.status(400).json({ msg: 'Thiếu userId' });
  }

  try {
    // KẾT HỢP 3 BẢNG: Users -> ProjectMembers -> Projects
    // Để lấy tên dự án, vai trò, ngày tham gia
    const query = `
      SELECT p.id, p.name, p.status, pm.role, pm.joined_at
      FROM Projects p
      JOIN ProjectMembers pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
    `;

    const [rows] = await db.execute(query, [userId]);
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server khi lấy dự án' });
  }
});

module.exports = router;