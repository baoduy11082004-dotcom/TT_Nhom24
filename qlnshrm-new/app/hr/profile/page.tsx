"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Building2, User, Briefcase, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const router = useRouter()
  // Khởi tạo state rỗng để chờ dữ liệu
  const [user, setUser] = useState({
    id: "HR...",
    name: "Đang tải...",
    email: "",
    role: "Nhân viên",
    phone: "",
    department: "",
    bio: "",
    imageURL: "/placeholder.svg",
    location: "Hồ Chí Minh",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const localUser = JSON.parse(storedUser)
        
        try {
          // Thêm _t để tránh cache, luôn lấy dữ liệu mới nhất vừa lưu
          const res = await fetch(`http://localhost:5000/api/user/profile/${localUser.id}?_t=${Date.now()}`)
          
          if (res.ok) {
            const data = await res.json()
            
            let displayTeam = data.team_id || data.team || "Chưa cập nhật";
            const teamMap: Record<string, string> = {
                'dev': 'Kỹ thuật (Engineering)',
                'design': 'Thiết kế (Design)',
                'qa': 'Kiểm thử (QA)',
                'hr': 'Nhân sự (HR)',
                'marketing': 'Marketing'
            };
            // Chuyển đổi tên team nếu có trong map
            if (displayTeam.toLowerCase() in teamMap) {
                displayTeam = teamMap[displayTeam.toLowerCase()];
            } else {
                displayTeam = displayTeam.charAt(0).toUpperCase() + displayTeam.slice(1);
            }

            setUser(prev => ({
              ...prev,
              id: data.id,
              name: data.name || prev.name,
              email: data.email || prev.email,
              role: data.role || prev.role,
              imageURL: data.image_url || "/placeholder.svg", 
              // Hiển thị dữ liệu từ server, nếu rỗng thì hiện text mặc định
              phone: data.phone || "Chưa cập nhật",
              bio: data.bio || "Chưa có giới thiệu về bản thân.",
              department: displayTeam
            }))
          }
        } catch (e) {
          console.error("Lỗi tải profile:", e)
        }
      }
    }
    fetchUserData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* HEADER: Tiêu đề & Nút Sửa */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thông tin cá nhân (HR)</h1>
        
        <Button 
            variant="outline" 
            onClick={() => router.push('/hr/settings/profile')}
            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black border shadow-sm"
        >
            <Edit className="w-4 h-4" /> Chỉnh sửa thông tin
        </Button>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* CỘT TRÁI: ẢNH & QR */}
        <Card className="w-full md:w-1/3 shadow-sm border-gray-200 dark:border-gray-700 h-fit">
          <CardHeader className="text-center pb-2">
            <h3 className="font-semibold text-lg mb-4">Ảnh đại diện</h3>
            <div className="mx-auto mb-4 relative group">
              <Avatar className="h-40 w-40 mx-auto border-4 border-white shadow-lg ring-1 ring-gray-100">
                <AvatarImage src={user.imageURL} alt={user.name} className="object-cover" />
                <AvatarFallback className="text-4xl bg-blue-100 text-blue-600">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <div className="mt-2 flex justify-center">
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-purple-100 text-purple-700 border-none">
                {user.role}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center pt-4 border-t border-dashed mt-4">
            <div className="bg-white p-3 rounded-xl border border-gray-200 mb-3 shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${user.id}`}
                alt="Mã chấm công"
                className="h-32 w-32 opacity-90"
              />
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <span>{user.id}</span>
            </div>
            <p className="text-xs text-blue-500 mt-1 font-medium">Mã chấm công</p>
          </CardContent>
        </Card>

        {/* CỘT PHẢI: CHI TIẾT (READ ONLY) */}
        <Card className="w-full md:w-2/3 shadow-sm border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50 pb-4">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <User className="w-5 h-5" />
              <CardTitle className="text-lg font-semibold">Chi tiết hồ sơ</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">GIỚI THIỆU</label>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 min-h-[80px]">
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed whitespace-pre-wrap">
                  {user.bio}
                </p>
              </div>
            </div>

            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 border rounded-md p-2.5 bg-gray-50/50">
                    {user.email}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <Building2 className="w-3.5 h-3.5" /> Phòng ban
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 border rounded-md p-2.5 bg-gray-50/50">
                    {user.department}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <Phone className="w-3.5 h-3.5" /> Số điện thoại
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 border rounded-md p-2.5 bg-gray-50/50">
                    {user.phone}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                    <Briefcase className="w-3.5 h-3.5" /> Chức vụ / Họ tên
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 border rounded-md p-2.5 bg-gray-50/50">
                    {user.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex items-center text-xs text-gray-400 gap-2">
                <MapPin className="w-3 h-3" />
                <span>Văn phòng: {user.location}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}