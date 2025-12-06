"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfileSettings() {
  const [loading, setLoading] = useState(false)
  
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    bio: "",
    imageURL: "" // Frontend dùng camelCase cho tiện
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. LẤY DỮ LIỆU TỪ SERVER
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const localUser = JSON.parse(storedUser)
        setFormData(prev => ({ ...prev, id: localUser.id }))

        try {
          // Gọi API lấy thông tin chi tiết (dùng chung API user)
          const res = await fetch(`http://localhost:5000/api/user/profile/${localUser.id}`)
          if (res.ok) {
            const data = await res.json()
            
            // Xử lý hiển thị tên phòng ban cho đẹp
            let displayTeam = data.team_id || data.team || "Chưa cập nhật";
            if(displayTeam && displayTeam.toLowerCase().includes('dev')) displayTeam = "Kỹ thuật (Engineering)";
            else if(displayTeam && displayTeam.toLowerCase().includes('design')) displayTeam = "Thiết kế (Design)";
            else if(displayTeam && displayTeam.toLowerCase().includes('hr')) displayTeam = "Nhân sự (HR)";

            setFormData({
              id: data.id,
              name: data.name || "",
              email: data.email || "", // Quan trọng: Phải lấy email về state
              phone: data.phone || "",
              department: displayTeam,
              bio: data.bio || "",
              // Backend thường trả về snake_case (image_url), frontend map sang camelCase
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
    // Map id input sang key state (fullName -> name)
    const key = id === "fullName" ? "name" : id;
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // 2. XỬ LÝ CHỌN ẢNH (CHUYỂN FILE SANG BASE64)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Tăng giới hạn lên 2MB cho thoải mái
        alert("Ảnh quá nặng! Vui lòng chọn ảnh nhỏ hơn 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, imageURL: base64String }))
      };
      reader.readAsDataURL(file);
    }
  }

  // 3. GỬI LÊN SERVER (QUAN TRỌNG: MAP ĐÚNG KEY CHO BACKEND)
  const handleSave = async () => {
    if (!formData.id) return alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
    if (!formData.email) return alert("Lỗi: Không tìm thấy Email trong dữ liệu. Vui lòng tải lại trang.");

    setLoading(true)

    try {
      console.log("Đang gửi dữ liệu cập nhật cho ID:", formData.id);

      // Chuẩn bị payload đúng format mà backend User.js mong đợi
      const payload = {
        name: formData.name,
        email: formData.email,      // BẮT BUỘC: Backend cần cái này để không bị lỗi NULL
        phone: formData.phone,
        bio: formData.bio,
        image_url: formData.imageURL // QUAN TRỌNG: Đổi sang snake_case để khớp với DB
      };
      
      console.log("Payload gửi đi:", payload);

      const res = await fetch(`http://localhost:5000/api/user/update/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const result = await res.json()
        
        // Cập nhật lại localStorage để các trang khác hiển thị đúng ngay lập tức
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
        // Merge thông tin cũ với thông tin mới trả về từ server
        const newUser = { ...storedUser, ...result.user, ...payload } 
        // Lưu ý: result.user từ backend có thể thiếu trường nếu backend không trả về full user, 
        // nên ta merge thêm payload để chắc chắn UI cập nhật ngay.
        
        localStorage.setItem("user", JSON.stringify(newUser))

        alert("✅ Cập nhật hồ sơ thành công!");
        window.location.reload(); 
      } else {
        const err = await res.json();
        console.error("Lỗi Server trả về:", err);
        alert(`❌ Lỗi cập nhật: ${err.msg || err.message || "Lỗi không xác định từ server"}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("⚠️ Không thể kết nối đến Server. Hãy kiểm tra xem Backend (cửa sổ đen) có đang chạy không.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ cá nhân (HR)</CardTitle>
          <CardDescription>Quản lý thông tin hiển thị của bạn trên hệ thống.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24 border-2">
              <AvatarImage src={formData.imageURL} className="object-cover" />
              <AvatarFallback>HR</AvatarFallback>
            </Avatar>
            <div>
                {/* Input file ẩn */}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Thay đổi ảnh đại diện</Button>
                <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG (Max 2MB)</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" value={formData.name} onChange={handleChange} placeholder="Nhập họ tên..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500 text-xs">(Không thể sửa)</span></Label>
              {/* ReadOnly nhưng vẫn phải giữ trong state để gửi đi */}
              <Input id="email" value={formData.email} readOnly className="bg-gray-100 text-gray-500 cursor-not-allowed" />
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
            <Label htmlFor="bio">Giới thiệu bản thân (Bio)</Label>
            <Textarea 
              id="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              className="min-h-[100px]" 
              placeholder="Chia sẻ đôi chút về kinh nghiệm nhân sự của bạn..." 
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-xs text-gray-400 italic">Lần cập nhật cuối: Vừa xong</p>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}