const db = require("./config/db");
const bcrypt = require("bcryptjs");

const seedData = async () => {
  try {
    console.log("--- ĐANG KHỞI TẠO DỮ LIỆU MẪU ---");

    // 1. Xóa dữ liệu cũ để tránh trùng lặp
    await db.execute("DELETE FROM users");
    console.log("✅ Đã xóa dữ liệu cũ.");

    // 2. Tạo mật khẩu hash chung cho tất cả là "123456"
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("123456", salt);

    // 3. Danh sách nhân viên (Dữ liệu giả phong phú)
    const users = [
      // --- TEAM DESIGN ---
      {
        id: "people_0",
        name: "Lily Grace",
        email: "lily.grace@company.com",
        role: "UI Designer",
        team: "design",
        is_hr: false,
        image_url:
          "https://res.cloudinary.com/ds574fco0/image/upload/v1753690876/people/0_riwhwx.jpg",
      },
      {
        id: "des_001",
        name: "Phạm Minh Design",
        email: "minh.pham@company.com",
        role: "Graphic Designer",
        team: "design",
        is_hr: false,
        image_url: "/placeholder.svg",
      },

      // --- TEAM DEV ---
      {
        id: "people_1",
        name: "Adam Reid",
        email: "adam.reid@company.com",
        role: "Frontend Developer",
        team: "dev",
        is_hr: false,
        image_url:
          "https://res.cloudinary.com/ds574fco0/image/upload/v1753690877/people/1_ndgrxc.jpg",
      },
      {
        id: "dev_002",
        name: "Nguyễn Văn Dev",
        email: "van.nguyen@company.com",
        role: "Backend Lead",
        team: "dev",
        is_hr: false,
        image_url: "/placeholder.svg",
      },
      {
        id: "dev_003",
        name: "Lê Fullstack",
        email: "le.fullstack@company.com",
        role: "Fullstack Developer",
        team: "dev",
        is_hr: false,
        image_url: "/placeholder.svg",
      },

      // --- TEAM QA/TESTER ---
      {
        id: "people_2",
        name: "Owen Scott",
        email: "owen.scott@company.com",
        role: "QA Engineer",
        team: "qa",
        is_hr: false,
        image_url:
          "https://res.cloudinary.com/ds574fco0/image/upload/v1753690877/people/2_qz3dx8.jpg",
      },
      {
        id: "qa_002",
        name: "Trần Tester",
        email: "tran.tester@company.com",
        role: "Automation Tester",
        team: "qa",
        is_hr: false,
        image_url: "/placeholder.svg",
      },

      // --- TEAM MARKETING ---
      {
        id: "mkt_001",
        name: "Sarah Marketing",
        email: "sarah.mkt@company.com",
        role: "Content Creator",
        team: "marketing",
        is_hr: false,
        image_url: "/placeholder.svg",
      },

      // --- TEAM HR (QUẢN TRỊ) ---
      {
        id: "hr_admin",
        name: "Trần Thị B (Admin)",
        email: "admin.hr",
        role: "HR Manager",
        team: "hr",
        is_hr: true, // is_hr = true -> Quyền quản trị
        image_url: "/placeholder.svg",
      },
      {
        id: "hr_staff",
        name: "Lê HR Staff",
        email: "staff.hr@company.com",
        role: "HR Executive",
        team: "hr",
        is_hr: true, // Cũng là HR
        image_url: "/placeholder.svg",
      },
    ];

    // 4. Chạy vòng lặp Insert
    const insertQuery = `
      INSERT INTO users (id, name, email, password, role, is_hr, team_id, image_url, work_start, work_end) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, '08:00', '17:00')
    `;

    for (const user of users) {
      await db.execute(insertQuery, [
        user.id,
        user.name,
        user.email,
        passwordHash,
        user.role,
        user.is_hr,
        user.team,
        user.image_url,
      ]);
      console.log(`+ Đã thêm user: ${user.name} (${user.role})`);
    }

    console.log("✅ ĐÃ TẠO XONG DỮ LIỆU MẪU!");
    console.log("------------------------------------------------");
    console.log("👉 Tài khoản Admin HR:   admin.hr / 123456");
    console.log("👉 Tài khoản Dev:        adam.reid@company.com / 123456");
    console.log("👉 Tài khoản Tester:     tran.tester@company.com / 123456");
    console.log("------------------------------------------------");

    process.exit();
  } catch (err) {
    console.error("❌ Lỗi khi tạo dữ liệu:", err);
    process.exit(1);
  }
};

seedData();
