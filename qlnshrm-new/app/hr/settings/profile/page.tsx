"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation" 

export default function ProfileSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    teamId: "",     
    bio: "",
    imageURL: "" 
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. LẤY DỮ LIỆU CŨ ĐỂ HIỂN THỊ LÊN FORM
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const localUser = JSON.parse(storedUser)
        setFormData(prev => ({ ...prev, id: localUser.id, email: localUser.email || "" }))

        try {
          // Gọi API lấy thông tin chi tiết (để điền vào các ô input)
          const res = await fetch(`http://localhost:5000/api/user/profile/${localUser.id}?_t=${Date.now()}`)
          if (res.ok) {
            const data = await res.json()
            
            let displayTeam = data.team || data.team_id || "Chưa cập nhật";
            const rawTeam = data.team || data.team_id || "";

            // Mapping tên phòng ban
            if(displayTeam && displayTeam.toLowerCase().includes('dev')) displayTeam = "Kỹ thuật (Engineering)";
            else if(displayTeam && displayTeam.toLowerCase().includes('design')) displayTeam = "Thiết kế (Design)";
            else if(displayTeam && displayTeam.toLowerCase().includes('hr')) displayTeam = "Nhân sự (HR)";

            setFormData({
              id: data.id,
              name: data.name || "",
              email: data.email || localUser.email || "",
              phone: data.phone || "", // Lấy sđt cũ
              department: displayTeam,
              teamId: rawTeam, 
              bio: data.bio || "", // Lấy bio cũ
              imageURL: data.image_url || "/placeholder.svg"
            })
          }
        } catch (e) { console.error("Lỗi tải dữ liệu:", e) }
      }
    }
    fetchUserData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    const key = id === "fullName" ? "name" : id;
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ảnh quá nặng! Vui lòng chọn ảnh nhỏ hơn 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageURL: reader.result as string }))
      };
      reader.readAsDataURL(file);
    }
  }

  // 2. LƯU VÀ CHUYỂN HƯỚNG
  const handleSave = async () => {
    if (!formData.id) return alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
    
    const finalEmail = formData.email || JSON.parse(localStorage.getItem("user") || "{}").email;
    if (!finalEmail) return alert("Lỗi: Không tìm thấy Email! Vui lòng điền Email.");

    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        email: finalEmail,
        phone: formData.phone,
        bio: formData.bio,
        image_url: formData.imageURL, 
        team: formData.teamId,      
        department: formData.department 
      };
      
      const res = await fetch(`http://localhost:5000/api/user/update/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const result = await res.json()
        
        // Cập nhật localStorage
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
        const newUser = { ...storedUser, ...result.user, ...payload } 
        localStorage.setItem("user", JSON.stringify(newUser))

        alert("✅ Đã lưu thành công!");
        
        // --- QUAN TRỌNG: CHUYỂN HƯỚNG VỀ TRANG XEM ---
        // Sử dụng window.location.href để ép tải lại trang mới hoàn toàn, đảm bảo thấy dữ liệu mới
        window.location.href = "/hr/profile"; 
        
      } else {
        const err = await res.json();
        alert(`❌ Lỗi cập nhật: ${err.msg || err.message}`);
      }
    } catch (error) {
      alert("⚠️ Không thể kết nối đến Server.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
          <CardDescription>Cập nhật thông tin cá nhân của bạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24 border-2">
              <AvatarImage src={formData.imageURL} className="object-cover" />
              <AvatarFallback>HR</AvatarFallback>
            </Avatar>
            <div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Thay đổi ảnh đại diện</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" value={formData.name} onChange={handleChange} placeholder="Nhập họ tên..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={formData.email} onChange={handleChange} placeholder="email@company.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="09xxxx..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Phòng ban</Label>
              <Input id="department" value={formData.department} readOnly className="bg-gray-100 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Giới thiệu bản thân</Label>
            <Textarea 
              id="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              className="min-h-[100px]" 
              placeholder="Viết đôi dòng về bạn..." 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => router.push("/hr/profile")}>Hủy</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}