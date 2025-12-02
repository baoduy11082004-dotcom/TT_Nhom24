"use client"

import type React from "react"
import { useEffect, useState } from "react" // Đã thêm useState
import { usePathname, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Users, Clock, LayoutDashboard, CalendarPlus, ClipboardList, UserCircle } from "lucide-react"

interface Project {
  id: string
  name: string
  color: string
}

interface Note {
  id: string
  title: string
  description: string
  completed: boolean
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  
  // --- PHẦN 1: STATE QUẢN LÝ THÔNG TIN USER ---
  // Khởi tạo thông tin mặc định để tránh lỗi khi chưa load xong
  const [currentUser, setCurrentUser] = useState({
    name: "Đang tải...",
    email: "",
    role: "",
    imageURL: "/placeholder.svg?height=32&width=32",
  })

  // --- PHẦN 2: LẤY DỮ LIỆU TỪ LOCAL STORAGE ---
  useEffect(() => {
    // 1. Kiểm tra redirect trang chủ
    if (pathname === "/") {
      router.push("/login")
    }

    // 2. Lấy thông tin user thật từ localStorage (Do lúc Login lưu vào)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        
        // Cập nhật State hiển thị lên màn hình
        setCurrentUser({
          name: parsedUser.name || "Người dùng",
          email: parsedUser.email || "",
          role: parsedUser.role || "N/A",
          // Lưu ý: Database trả về 'image_url' (snake_case) hoặc 'imageURL' tùy lúc seed
          // Ta kiểm tra cả 2 trường hợp để chắc chắn có ảnh
          imageURL: parsedUser.image_url || parsedUser.imageURL || "/placeholder.svg?height=32&width=32"
        })
      } catch (error) {
        console.error("Lỗi đọc dữ liệu user:", error)
      }
    }
  }, [pathname, router])

  const isLoginPage = pathname === "/login"
  const isScannerPage = pathname === "/scanner"

  if (isLoginPage || isScannerPage) {
    return <>{children}</>
  }

  // --- PHẦN 3: CẤU HÌNH MENU (GIỮ NGUYÊN) ---
  const isHR = pathname.startsWith("/hr")
  const isEmployee = pathname.startsWith("/employee")

  const hrNavItems = [
    { name: "Tổng quan", icon: LayoutDashboard, path: "/hr/dashboard" },
    { name: "Thông tin cá nhân", icon: UserCircle, path: "/hr/profile" },
    { name: "Nhân sự", icon: Users, path: "/hr/people" },
    { name: "Chấm công", icon: Clock, path: "/hr/timekeeping" },
    { name: "Duyệt nghỉ phép", icon: ClipboardList, path: "/hr/leave-requests" },
  ]

  const employeeNavItems = [
    { name: "Tổng quan & Bảng lương", icon: LayoutDashboard, path: "/employee/dashboard" },
    { name: "Thông tin cá nhân", icon: UserCircle, path: "/employee/profile" },
    { name: "Xin nghỉ phép", icon: CalendarPlus, path: "/employee/leave-request" },
  ]

  const navItems = isHR ? hrNavItems : isEmployee ? employeeNavItems : []

  // Đã xóa phần hardcode "Nguyễn Văn A" / "Quản Trị Viên" ở đây
  // Bây giờ biến currentUser (từ useState ở trên) sẽ được truyền xuống dưới

  return (
    <DashboardLayout navItems={navItems} currentUser={currentUser}>
      {children}
    </DashboardLayout>
  )
}