"use client"

import type React from "react"
import { useEffect } from "react"
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
  const isLoginPage = pathname === "/login"
  const isScannerPage = pathname === "/scanner"

  useEffect(() => {
    if (pathname === "/") {
      router.push("/login")
    }
  }, [pathname, router])

  if (isLoginPage || isScannerPage) {
    return <>{children}</>
  }

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

  const currentUser = isHR
    ? {
        name: "Quản Trị Viên",
        email: "admin.hr@company.com",
        role: "HR Manager",
        imageURL: "/placeholder.svg?height=32&width=32",
      }
    : {
        name: "Nguyễn Văn A",
        email: "nguyen.vana@company.com",
        role: "Employee",
        imageURL: "/placeholder.svg?height=32&width=32",
      }

  return (
    <DashboardLayout navItems={navItems} currentUser={currentUser}>
      {children}
    </DashboardLayout>
  )
}
