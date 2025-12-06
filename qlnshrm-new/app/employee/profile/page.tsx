"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, MapPin, Building2, User, Hash } from "lucide-react"

export default function ProfilePage() {
  // 1. Khởi tạo State
  const [user, setUser] = useState({
    name: "Đang tải...",
    role: "Nhân viên",
    email: "loading...",
    id: "EMP...",
    imageURL: "/placeholder.svg",
    team: "Engineering",
    phone: "", 
    bio: "", // Trường Bio mới
    dob: "15/08/1995", 
    joinDate: "15/03/2022",
    location: "Hồ Chí Minh",
  })

  // 2. Lấy dữ liệu thật từ LocalStorage (đã được trang Settings cập nhật)
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const realUser = JSON.parse(storedUser)
        
        // Xử lý tên phòng ban
        let displayTeam = realUser.team_id || realUser.team || "Chưa cập nhật";
        if(displayTeam.toLowerCase().includes('dev')) displayTeam = "Kỹ thuật (Dev)";
        if(displayTeam.toLowerCase().includes('design')) displayTeam = "Thiết kế (Design)";
        if(displayTeam.toLowerCase().includes('qa')) displayTeam = "Kiểm thử (QA)";
        if(displayTeam.toLowerCase().includes('hr')) displayTeam = "Nhân sự (HR)";

        setUser(prev => ({
          ...prev,
          name: realUser.name || prev.name,
          email: realUser.email || prev.email,
          role: realUser.role || prev.role,
          id: realUser.id || prev.id,
          // 👇 CẬP NHẬT 2 DÒNG NÀY ĐỂ HIỆN SĐT VÀ BIO MỚI
          phone: realUser.phone || "Chưa cập nhật", 
          bio: realUser.bio || "Chưa có giới thiệu...", 
          
          team: displayTeam,
          imageURL: realUser.image_url || realUser.imageURL || prev.imageURL
        }))
        
      } catch (e) {
        console.error("Lỗi đọc profile:", e)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* CỘT TRÁI: AVATAR & QR */}
        <Card className="w-full md:w-1/3">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 relative">
              <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-lg">
                <AvatarImage src={user.imageURL} alt={user.name} className="object-cover" />
                <AvatarFallback className="text-4xl bg-blue-100 text-blue-600">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
            <div className="mt-2 flex justify-center">
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100">
                {user.role}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center pt-4 border-t mt-4">
            <div className="bg-white p-3 rounded-xl border shadow-sm mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user.id}`}
                alt="Mã chấm công"
                className="h-32 w-32"
              />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Hash className="w-4 h-4" />
              <span>{user.id}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Quét mã này để chấm công</p>
          </CardContent>
        </Card>

        {/* CỘT PHẢI: CHI TIẾT HỒ SƠ */}
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-blue-600" />
              Chi tiết hồ sơ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* PHẦN BIO (ĐÃ ĐƯỢC CẬP NHẬT ĐỂ HIỂN THỊ ĐÚNG) */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Giới thiệu</p>
              <p className="text-gray-700 dark:text-gray-300 italic">
                "{user.bio}"
              </p>
            </div>

            {/* Grid thông tin chi tiết */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <Mail className="w-4 h-4" /> Email
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <Phone className="w-4 h-4" /> Điện thoại
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.phone}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" /> Ngày sinh
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.dob}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <Building2 className="w-4 h-4" /> Phòng ban
                </div>
                <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
                  {user.team}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" /> Ngày vào làm
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.joinDate}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4" /> Văn phòng
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}