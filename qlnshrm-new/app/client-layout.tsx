"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Users, Clock, LayoutDashboard, CalendarPlus, ClipboardList, UserCircle } from "lucide-react"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  
  // State lưu thông tin user để hiển thị lên Sidebar/Header
  const [currentUser, setCurrentUser] = useState({
    name: "Đang tải...",
    email: "",
    role: "",
    imageURL: "/placeholder.svg?height=32&width=32",
  })

  // --- LOGIC BẢO MẬT & ĐIỀU HƯỚNG ---
  useEffect(() => {
    // 1. Các trang KHÔNG CẦN đăng nhập thì bỏ qua kiểm tra
    const publicPaths = ["/login", "/scanner", "/","/forgot-password", "/reset-password"];
    if (publicPaths.includes(pathname)) {
      if (pathname === "/") router.push("/login"); // Trang chủ tự về login
      return;
    }

    // 2. Lấy thông tin user từ LocalStorage
    const storedUser = localStorage.getItem("user")
    
    if (!storedUser) {
      // Nếu chưa đăng nhập (không có data) -> Đá về Login ngay
      router.push("/login")
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      
      // Cập nhật State để hiển thị giao diện
      setCurrentUser({
        name: parsedUser.name || "Người dùng",
        email: parsedUser.email || "",
        role: parsedUser.role || "N/A",
        imageURL: parsedUser.image_url || parsedUser.imageURL || "/placeholder.svg?height=32&width=32"
      })

      // --- 3. KIỂM TRA QUYỀN TRUY CẬP (AUTHORIZATION) ---
      
      // Nếu là Nhân viên (is_hr = 0 hoặc false) mà cố vào trang HR
      if (!parsedUser.is_hr && pathname.startsWith("/hr")) {
        alert("⛔ Bạn không có quyền truy cập vào trang Quản trị (HR)!");
        router.push("/employee/dashboard"); // Đẩy về trang nhân viên
        return;
      }

      // Nếu là HR (is_hr = 1) mà cố vào trang Nhân viên (Tuỳ chọn, để tránh nhầm lẫn)
      if (parsedUser.is_hr && pathname.startsWith("/employee")) {
        // Có thể cho phép hoặc đẩy về HR Dashboard tuỳ nghiệp vụ
        // Ở đây ta đẩy về HR Dashboard để giữ luồng riêng biệt
        router.push("/hr/dashboard");
        return;
      }

    } catch (error) {
      console.error("Lỗi xác thực:", error)
      localStorage.removeItem("user"); // Xóa rác nếu lỗi
      router.push("/login");
    }
  }, [pathname, router])

  // Nếu đang ở trang Login hoặc Scanner thì hiển thị full màn hình (không có Layout Dashboard)
  const isLoginPage = pathname === "/login"
  const isScannerPage = pathname === "/scanner"

  if (isLoginPage || isScannerPage) {
    return <>{children}</>
  }

  // --- CẤU HÌNH MENU CHO TỪNG VAI TRÒ ---
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

  // Chọn menu tương ứng dựa trên URL hiện tại
  const navItems = isHR ? hrNavItems : isEmployee ? employeeNavItems : []

  return (
    <DashboardLayout navItems={navItems} currentUser={currentUser}>
      {children}
    </DashboardLayout>
  )
}