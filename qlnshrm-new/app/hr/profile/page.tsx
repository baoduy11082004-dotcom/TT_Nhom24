"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Mail, Phone, Calendar, MapPin, Building2, User, Hash, Edit } from "lucide-react"

export default function HRProfilePage() {
  const router = useRouter()
  
  // 1. Khởi tạo State (Giống cấu trúc bên Employee)
  const [user, setUser] = useState({
    name: "Đang tải...",
    role: "Quản trị viên (HR)",
    email: "loading...",
    id: "HR...",
    imageURL: "/placeholder.svg",
    team: "Human Resources",
    phone: "Chưa cập nhật", 
    bio: "Chưa có giới thiệu...", 
    dob: "Chưa cập nhật", 
    joinDate: "Chưa cập nhật",
    location: "Hồ Chí Minh",
  })

  // 2. Lấy dữ liệu thật từ API
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const localUser = JSON.parse(storedUser)

          // Gọi API lấy dữ liệu mới nhất (Sửa lại đường dẫn API cho đúng)
          const res = await fetch(`http://localhost:5000/api/user/${localUser.id}?_t=${Date.now()}`)
          
          if (res.ok) {
            const data = await res.json()

            // Xử lý tên phòng ban hiển thị cho đẹp
            let displayTeam = data.team_id || data.team || "Chưa cập nhật";
            const teamMap: Record<string, string> = {
                'dev': 'Kỹ thuật (Dev)',
                'design': 'Thiết kế (Design)',
                'qa': 'Kiểm thử (QA)',
                'hr': 'Nhân sự (HR)',
                'marketing': 'Marketing'
            };
            if (displayTeam.toLowerCase() in teamMap) {
                displayTeam = teamMap[displayTeam.toLowerCase()];
            } else {
                displayTeam = displayTeam.charAt(0).toUpperCase() + displayTeam.slice(1);
            }

            // Cập nhật State
            setUser(prev => ({
              ...prev,
              id: data.id,
              name: data.name || prev.name,
              email: data.email || prev.email,
              role: data.role || prev.role,
              imageURL: data.image_url || "/placeholder.svg",
              team: displayTeam,
              // Các trường bổ sung (Nếu database chưa có cột này thì lấy giá trị mặc định hoặc từ localUser)
              phone: data.phone || localUser.phone || "0909 123 456", 
              bio: data.bio || localUser.bio || "Quản trị viên hệ thống nhân sự.",
              dob: data.dob || "01/01/1990",
              joinDate: data.created_at ? new Date(data.created_at).toLocaleDateString('vi-VN') : "01/01/2020",
              location: "Hồ Chí Minh"
            }))
          }
        } catch (e) {
          console.error("Lỗi đọc profile:", e)
        }
      }
    }
    fetchUserData()
  }, [])

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Tiêu đề & Nút Edit (Giữ lại nút Edit cho HR vì họ có quyền sửa) */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <Button 
            variant="outline" 
            onClick={() => router.push('/hr/settings/profile')}
            className="flex items-center gap-2"
        >
            <Edit className="w-4 h-4" /> Cập nhật thông tin
        </Button>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* CỘT TRÁI: AVATAR & QR (Giao diện giống Employee) */}
        <Card className="w-full md:w-1/3 shadow-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 relative">
              <Avatar className="h-32 w-32 mx-auto border-4 border-white shadow-lg ring-1 ring-gray-100">
                <AvatarImage src={user.imageURL} alt={user.name} className="object-cover" />
                <AvatarFallback className="text-4xl bg-blue-100 text-blue-600">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">{user.name}</CardTitle>
            <div className="mt-2 flex justify-center">
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">
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
            <p className="text-xs text-muted-foreground mt-1">Mã định danh hệ thống</p>
          </CardContent>
        </Card>

        {/* CỘT PHẢI: CHI TIẾT HỒ SƠ (Giao diện giống Employee) */}
        <Card className="w-full md:w-2/3 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-blue-700">
              <User className="w-5 h-5" />
              Chi tiết hồ sơ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Phần Bio */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-2 uppercase text-xs">Giới thiệu</p>
              <p className="text-gray-700 italic">
                "{user.bio}"
              </p>
            </div>

            {/* Grid thông tin chi tiết */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Mail className="w-4 h-4" /> Email
                </div>
                <p className="font-medium text-gray-900 break-words">{user.email}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Phone className="w-4 h-4" /> Điện thoại
                </div>
                <p className="font-medium text-gray-900">{user.phone}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Calendar className="w-4 h-4" /> Ngày sinh
                </div>
                <p className="font-medium text-gray-900">{user.dob}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Building2 className="w-4 h-4" /> Phòng ban
                </div>
                <p className="font-medium text-gray-900">
                  {user.team}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Calendar className="w-4 h-4" /> Ngày tham gia
                </div>
                <p className="font-medium text-gray-900">{user.joinDate}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <MapPin className="w-4 h-4" /> Văn phòng
                </div>
                <p className="font-medium text-gray-900">{user.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}