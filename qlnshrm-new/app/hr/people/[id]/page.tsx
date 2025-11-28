"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AttendanceHistory, type AttendanceRecord } from "@/components/attendance-history"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, FileDown } from "lucide-react"
import { people } from "@/lib/people"
import { useState } from "react"

// Mock data generator for a specific user
const generateMockAttendance = (year: number, month: number): AttendanceRecord[] => {
  const days = new Date(year, month + 1, 0).getDate()
  const records: AttendanceRecord[] = []

  for (let i = 1; i <= days; i++) {
    const date = new Date(year, month, i)
    const dayOfWeek = date.getDay()

    if (dayOfWeek === 0 || dayOfWeek === 6) continue // Skip generating for weekends (handled by component)

    if (i > 20) continue // Simulate future days

    const random = Math.random()
    let status: "on-time" | "late" | "absent" = "on-time"
    let checkIn = "08:00"

    if (random > 0.8) {
      status = "late"
      checkIn = "08:45"
    } else if (random > 0.95) {
      status = "absent"
      checkIn = ""
    }

    records.push({
      date,
      status,
      checkIn: status === "absent" ? undefined : checkIn,
      checkOut: status === "absent" ? undefined : "17:30",
    })
  }
  return records
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const personId = params.id as string
  const [isEditMode, setIsEditMode] = useState(false)

  const handleExportReport = () => {
    // Generate mock CSV content
    const headers = ["Ngày", "Trạng thái", "Giờ vào", "Giờ ra"]
    const rows = attendanceRecords.map((record) => [
      record.date.toLocaleDateString("vi-VN"),
      record.status === "on-time" ? "Đúng giờ" : record.status === "late" ? "Đi trễ" : "Vắng",
      record.checkIn || "-",
      record.checkOut || "-",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `bao_cao_cham_cong_${extendedPerson.name.replace(/\s+/g, "_")}_11_2025.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Find person from mock data or use placeholder
  const person = people.find((p) => p.id === personId) || {
    id: "1",
    name: "Nguyễn Văn A",
    role: "Nhân viên",
    email: "nguyenvana@company.com",
    imageURL: "/placeholder.svg",
    team: "engineering",
    workingHours: { start: "09:00", end: "17:00", timezone: "GMT+7" },
  }

  // Extended mock data
  const extendedPerson = {
    ...person,
    phone: "0901234567",
    dob: "15/08/1995",
    joinDate: "10/03/2022",
    location: "Hồ Chí Minh",
  }

  const attendanceRecords = generateMockAttendance(2025, 10) // Nov 2025

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 pl-0 hover:pl-2 transition-all">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách
      </Button>

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chi tiết nhân viên</h1>
        <Button onClick={handleExportReport} className="bg-green-600 hover:bg-green-700">
          <FileDown className="w-4 h-4 mr-2" />
          Xuất báo cáo tháng
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Thông tin nhân viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6 text-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={extendedPerson.imageURL || "/placeholder.svg"} />
                <AvatarFallback>{extendedPerson.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{extendedPerson.name}</h2>
              <p className="text-gray-500">{extendedPerson.role}</p>
              <Badge variant="outline" className="mt-2">
                {extendedPerson.team}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="font-medium">{extendedPerson.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-500 text-xs">Số điện thoại</p>
                  <p className="font-medium">{extendedPerson.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-500 text-xs">Ngày sinh</p>
                  <p className="font-medium">{extendedPerson.dob}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-500 text-xs">Ngày vào làm</p>
                  <p className="font-medium">{extendedPerson.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-gray-500 text-xs">Địa chỉ</p>
                  <p className="font-medium">{extendedPerson.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Calendar */}
        <div className="lg:col-span-2">
          <AttendanceHistory
            records={attendanceRecords}
            userName={extendedPerson.name}
            isEditMode={isEditMode}
            onEditModeChange={setIsEditMode}
            allowEdit={true}
          />
        </div>
      </div>
    </div>
  )
}
