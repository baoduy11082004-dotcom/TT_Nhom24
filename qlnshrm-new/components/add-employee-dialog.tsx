"use client"

import React, { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function AddEmployeeDialog({ open, onOpenChange, onSubmit }: AddEmployeeDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    team_id: "dev", // Mặc định
    imageURL: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Xử lý chọn ảnh -> Chuyển sang Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Ảnh quá lớn (Max 2MB)!");
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageURL: reader.result as string }))
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSubmit = () => {
    if(!formData.name || !formData.email) return alert("Vui lòng nhập Tên và Email!");
    onSubmit(formData)
    handleCancel() // Reset form sau khi gửi
  }

  const handleCancel = () => {
    setFormData({
      name: "", email: "", phone: "", role: "", team_id: "dev", imageURL: ""
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Thêm nhân sự mới</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          
          {/* PHẦN CHỌN ẢNH */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-24 h-24 border-2 border-dashed border-gray-300">
                <AvatarImage src={formData.imageURL} className="object-cover" />
                <AvatarFallback>IMG</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            <p className="text-xs text-gray-500">Chạm để tải ảnh đại diện</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Họ và tên <span className="text-red-500">*</span></Label>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-2">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@company.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="0909..." />
            </div>
            <div className="space-y-2">
              <Label>Chức vụ</Label>
              <Input name="role" value={formData.role} onChange={handleChange} placeholder="VD: Developer" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Phòng ban</Label>
            <select 
              name="team_id" 
              value={formData.team_id} 
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="dev">Kỹ thuật (Engineering)</option>
              <option value="design">Thiết kế (Design)</option>
              <option value="qa">Kiểm thử (QA)</option>
              <option value="marketing">Marketing</option>
              <option value="hr">Nhân sự (HR)</option>
            </select>
          </div>

        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>Hủy</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">Lưu nhân viên</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}