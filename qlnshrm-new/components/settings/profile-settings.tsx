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
    imageURL: ""
  })
  
  // Ref để kích hoạt input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 1. LẤY DỮ LIỆU TỪ SERVER KHI VÀO TRANG
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const localUser = JSON.parse(storedUser)
        // Lưu ý: Đảm bảo có ID để gửi lên server
        const currentId = localUser.id || "";
        setFormData(prev => ({ ...prev, id: currentId }))

        if (!currentId) return;

        try {
          const res = await fetch(`http://localhost:5000/api/user/profile/${currentId}`)
          if (res.ok) {
            const data = await res.json()
            
            // Xử lý hiển thị tên phòng ban cho đẹp
            let displayTeam = data.team_id || data.team || "Chưa cập nhật";
            if(displayTeam && displayTeam.toLowerCase().includes('dev')) displayTeam = "Kỹ thuật (Engineering)";
            if(displayTeam && displayTeam.toLowerCase().includes('design')) displayTeam = "Thiết kế (Design)";
            if(displayTeam && displayTeam.toLowerCase().includes('qa')) displayTeam = "Kiểm thử (QA)";
            if(displayTeam && displayTeam.toLowerCase().includes('hr')) displayTeam = "Nhân sự (HR)";

            setFormData({
              id: data.id,
              name: data.name || "",
              email: data.email || "",
              phone: data.phone || "",
              department: displayTeam,
              bio: data.bio || "",
              imageURL: data.image_url || "/placeholder.svg"
            })
          }
        } catch (e) { console.error(e) }
      }
    }
    fetchUserData()
  }, [])

  // Xử lý khi nhập liệu text
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    // Lưu ý: id của input phải trùng với key trong formData (fullName -> name)
    const key = id === "fullName" ? "name" : id;
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // 2. XỬ LÝ CHỌN ẢNH (GIỚI HẠN DUNG LƯỢNG AN TOÀN)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // GIỚI HẠN: Chỉ nhận ảnh dưới 500KB (0.5MB) để đảm bảo lưu được vào Database
      // Database MySQL mặc định thường giới hạn gói tin 4MB, nếu ảnh to quá sẽ lỗi kết nối
      if (file.size > 500 * 1024) {
        alert("Ảnh quá nặng! Vui lòng chọn ảnh nhỏ hơn 500KB để đảm bảo hệ thống lưu được.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Lưu chuỗi Base64 vào state
        setFormData(prev => ({ ...prev, imageURL: reader.result as string }))
      };
      reader.readAsDataURL(file);
    }
  }

  // 3. LƯU THAY ĐỔI
  const handleSave = async () => {
    if (!formData.id) {
        alert("Lỗi: Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.");
        return;
    }

    setLoading(true)
    try {
      console.log("Đang gửi dữ liệu lên server cho ID:", formData.id);
      
      const res = await fetch(`http://localhost:5000/api/user/update/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          imageURL: formData.imageURL // Gửi kèm ảnh
        })
      })

      if (res.ok) {
        const result = await res.json()
        
        // Cập nhật lại localStorage để các trang khác (Dashboard/Header) nhận diện ảnh mới ngay
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
        const newUser = { ...storedUser, ...result.user }
        localStorage.setItem("user", JSON.stringify(newUser))

        alert("✅ Cập nhật hồ sơ thành công! Ảnh đại diện đã được lưu.");
        window.location.reload(); // Tải lại trang để áp dụng thay đổi
      } else {
        // Nếu Server trả về lỗi 500 hoặc 400
        const errorData = await res.json();
        alert("❌ Lỗi Server: " + (errorData.msg || "Không thể lưu"));
      }
    } catch (error) {
      console.error(error);
      // Nếu nhảy vào đây thường là do Server tắt hoặc Ảnh quá lớn làm đứt kết nối
      alert("⚠️ Lỗi kết nối Server! Có thể ảnh quá lớn hoặc Server đã bị tắt. Hãy kiểm tra cửa sổ đen Terminal.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>Đây là cách người khác sẽ nhìn thấy bạn trên trang web.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* PHẦN ẢNH ĐẠI DIỆN */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24 border-2 border-gray-100">
              <AvatarImage src={formData.imageURL} className="object-cover" />
              <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            
            {/* Input file ẩn */}
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Thay đổi ảnh đại diện
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Khuyên dùng: Ảnh vuông, dung lượng dưới 500KB.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input 
                id="fullName" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Nhập họ tên của bạn" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={formData.email} 
                readOnly 
                className="bg-gray-100 cursor-not-allowed text-gray-500" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="Nhập số điện thoại" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Phòng ban</Label>
              <Input 
                id="department" 
                value={formData.department} 
                readOnly 
                className="bg-gray-100 cursor-not-allowed text-gray-500" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Giới thiệu bản thân (Bio)</Label>
            <Textarea 
                id="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Hãy giới thiệu một chút về bản thân bạn..." 
                className="min-h-[100px]" 
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}