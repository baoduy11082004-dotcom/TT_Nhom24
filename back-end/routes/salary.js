const express = require("express");
const router = express.Router();
const db = require("../config/db");

// --- CẤU HÌNH LƯƠNG ---
const STANDARD_WORK_DAYS = 26; // Số ngày công chuẩn trong tháng (thường là 24 hoặc 26)
const DILIGENCE_BONUS = 500000; // Tiền thưởng chuyên cần (500k)
const REQUIRED_DAYS_FOR_BONUS = 22; // Phải làm ít nhất 22 ngày mới được thưởng

// ==================================================
// API TÍNH BẢNG LƯƠNG (REAL-TIME)
// GET /api/salary/calculate?month=12&year=2025
// ==================================================
router.get("/calculate", async (req, res) => {
  try {
    // 1. Lấy tháng/năm từ query (nếu không có thì lấy tháng hiện tại)
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();

    console.log(`--> Đang tính lương tháng ${month}/${year}...`);

    // 2. Lấy danh sách tất cả nhân viên (trừ HR Admin nếu muốn)
    // [UPDATED] Đã đổi 'salary' thành 'base_salary' trong câu lệnh SQL
    const [employees] = await db.execute(
      "SELECT id, name, email, position, department, base_salary, image_url FROM users WHERE role = 'employee'"
    );

    const payroll = [];

    // 3. Vòng lặp tính lương cho từng nhân viên
    for (const emp of employees) {
      // a. Đếm số ngày công thực tế trong tháng
      const [attendanceStats] = await db.execute(
        `SELECT 
            COUNT(*) as total_days, 
            SUM(CASE WHEN status = 'Đi trễ' THEN 1 ELSE 0 END) as late_days
         FROM attendance 
         WHERE user_id = ? 
         AND MONTH(date) = ? AND YEAR(date) = ?`,
        [emp.id, month, year]
      );

      const workDays = attendanceStats[0].total_days || 0; // Số ngày đi làm
      const lateCount = attendanceStats[0].late_days || 0; // Số lần đi trễ

      // b. Tính Lương thực tế theo ngày công
      // [UPDATED] Sử dụng base_salary để tính toán
      const currentBaseSalary = emp.base_salary || 0; 
      
      const salaryPerDay = currentBaseSalary / STANDARD_WORK_DAYS;
      const actualBaseSalary = Math.round(salaryPerDay * workDays);

      // c. Tính Thưởng chuyên cần
      // Chỉ thưởng khi: Làm >= 22 ngày VÀ Không đi trễ lần nào
      let bonus = 0;
      let bonusNote = "Chưa đạt";

      if (workDays >= REQUIRED_DAYS_FOR_BONUS) {
          if (lateCount === 0) {
              bonus = DILIGENCE_BONUS;
              bonusNote = "Đạt thưởng";
          } else {
              bonusNote = `Bị trừ (Trễ ${lateCount} lần)`;
          }
      } else {
          bonusNote = `Chưa đủ công (${workDays}/${REQUIRED_DAYS_FOR_BONUS})`;
      }

      // d. Tổng lương thực nhận
      const totalIncome = actualBaseSalary + bonus;

      // Đẩy vào danh sách trả về
      payroll.push({
        id: emp.id,
        name: emp.name,
        department: emp.department,
        position: emp.position,
        base_salary: currentBaseSalary,      // [UPDATED] Trả về tên key mới
        work_days: workDays,          
        late_count: lateCount,        
        actual_salary: actualBaseSalary, 
        bonus: bonus,                 
        bonus_note: bonusNote,        
        total_income: totalIncome,    
        avatar: emp.image_url
      });
    }

    // Trả về kết quả
    res.json({
      month,
      year,
      standard_days: STANDARD_WORK_DAYS,
      data: payroll
    });

  } catch (error) {
    console.error("Lỗi tính lương:", error);
    res.status(500).json({ msg: "Lỗi server khi tính lương" });
  }
});

module.exports = router;