"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AttendanceHistory, type AttendanceRecord } from "@/components/attendance-history"
import { Calendar, Clock, DollarSign, AlertCircle, CheckCircle2, XCircle, FileText } from "lucide-react"

// Mock data generator for attendance
const generateMockAttendance = (year: number, month: number): AttendanceRecord[] => {
  const days = new Date(year, month + 1, 0).getDate()
  const records: AttendanceRecord[] = []

  for (let i = 1; i <= days; i++) {
    const date = new Date(year, month, i)
    const dayOfWeek = date.getDay()

    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    if (i > 22) continue

    const random = Math.random()
    let status: "on-time" | "late" | "absent" = "on-time"
    let checkIn = "08:00"

    if (random > 0.85) {
      status = "late"
      checkIn = "08:35"
    }

    records.push({
      date,
      status,
      checkIn: status === "absent" ? undefined : checkIn,
    })
  }
  return records
}

export default function EmployeeDashboard() {
  // Mock data for the employee
  const employee = {
    name: "Nguyễn Văn A",
    role: "Senior Developer",
    department: "Engineering",
    email: "nguyenvana@company.com",
    phone: "+84 901 234 567",
    location: "Hồ Chí Minh",
    joinDate: "15/03/2022",
    avatar: "/placeholder.svg",
    salary: {
      basic: 25000000,
      allowance: 3000000,
      bonus: 2000000,
      deduction: 1000000,
      net: 29000000,
      month: "11/2025",
    },
    attendance: {
      totalDays: 22,
      present: 20,
      late: 1,
      absent: 1,
      leaveBalance: 10,
    },
    id: "EMP001",
  }

  const attendanceRecords = generateMockAttendance(2025, 10)

  const handleLeaveRequest = () => {
    window.location.href = "/employee/leave-request"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Xin chào, {employee.name} 👋</h1>
          <p className="text-gray-600 dark:text-gray-400">Đây là thông tin làm việc và bảng lương của bạn</p>
        </div>
        <Button onClick={handleLeaveRequest} className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="w-4 h-4 mr-2" />
          Xin nghỉ phép
        </Button>
      </div>

      <div className="space-y-6">
        {/* Detailed Attendance History View */}
        <AttendanceHistory records={attendanceRecords} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Attendance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-500" />
                Thống kê chấm công (Tháng {employee.salary.month})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tổng ngày công</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{employee.attendance.totalDays}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1 gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Đúng giờ</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{employee.attendance.present}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1 gap-1">
                    <AlertCircle className="w-3 h-3 text-yellow-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Đi trễ</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{employee.attendance.late}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center mb-1 gap-1">
                    <XCircle className="w-3 h-3 text-red-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vắng mặt</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{employee.attendance.absent}</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Số ngày phép còn lại</span>
                  <span className="text-sm font-bold">{employee.attendance.leaveBalance} ngày</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Slip */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
                Phiếu lương tháng {employee.salary.month}
              </CardTitle>
              <CardDescription>Chi tiết thu nhập và khấu trừ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Lương cơ bản</span>
                  <span className="font-medium">{employee.salary.basic.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Phụ cấp</span>
                  <span className="font-medium text-green-600">
                    +{employee.salary.allowance.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Thưởng hiệu suất</span>
                  <span className="font-medium text-green-600">+{employee.salary.bonus.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Khấu trừ (BHXH, Thuế)</span>
                  <span className="font-medium text-red-600">
                    -{employee.salary.deduction.toLocaleString("vi-VN")} ₫
                  </span>
                </div>

                <div className="flex justify-between items-center pt-4 mt-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <span className="font-bold text-lg">Thực nhận</span>
                  <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
                    {employee.salary.net.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Tải phiếu lương PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
