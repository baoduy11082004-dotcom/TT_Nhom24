"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, ArrowLeft, Send } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function LeaveRequestPage() {
  const router = useRouter()
  
  // 1. Khởi tạo dữ liệu người dùng (Mặc định rỗng)
  const [user, setUser] = useState({
    name: "",
    id: "",
    email: "",
    phone: "",
    team: ""
  })

  // State cho ngày tháng và lý do
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 2. Lấy dữ liệu thật từ LocalStorage khi vào trang
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const realUser = JSON.parse(storedUser)
        setUser({
          name: realUser.name || "",
          id: realUser.id || "",
          email: realUser.email || "",
          // Database chưa có sđt, ta lấy số mặc định hoặc để trống
          phone: "+84 901 234 567", 
          // Database lưu 'team' hoặc 'team_id', ta hiển thị cho đẹp
          team: realUser.team === 'dev' ? 'Phát triển (Dev)' :
                realUser.team === 'qa' ? 'Kiểm thử (QA)' :
                realUser.team === 'design' ? 'Thiết kế (Design)' : 
                realUser.team || "Chưa cập nhật"
        })
      } catch (e) {
        console.error("Lỗi đọc dữ liệu user", e)
      }
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Giả lập gửi API
    setTimeout(() => {
      alert("Gửi đơn xin nghỉ phép thành công! Đang chờ HR duyệt.")
      setIsSubmitting(false)
      router.push("/employee/dashboard")
    }, 1500)
  }

  return (
    <div className="container max-w-3xl py-6 mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Đơn Xin Nghỉ Phép</CardTitle>
          <CardDescription>
            Vui lòng điền đầy đủ thông tin bên dưới để gửi yêu cầu đến phòng nhân sự.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            
            {/* HÀNG 1: HỌ TÊN & MÃ NV (Tự động điền & Khóa) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input 
                  id="fullName" 
                  value={user.name} 
                  readOnly 
                  className="bg-gray-100 cursor-not-allowed font-medium" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Mã nhân viên</Label>
                <Input 
                  id="employeeId" 
                  value={user.id} 
                  readOnly 
                  className="bg-gray-100 cursor-not-allowed font-medium" 
                />
              </div>
            </div>

            {/* HÀNG 2: SĐT & PHÒNG BAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input 
                  id="phone" 
                  value={user.phone} 
                  onChange={(e) => setUser({...user, phone: e.target.value})}
                  placeholder="Nhập số điện thoại liên hệ" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Phòng ban</Label>
                <Input 
                  id="department" 
                  value={user.team} 
                  readOnly 
                  className="bg-gray-100 cursor-not-allowed" 
                />
              </div>
            </div>

            {/* HÀNG 3: CHỌN NGÀY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label>Từ ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : <span>Chọn ngày bắt đầu</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 flex flex-col">
                <Label>Đến ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : <span>Chọn ngày kết thúc</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* HÀNG 4: LÝ DO */}
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do nghỉ phép</Label>
              <Textarea
                id="reason"
                placeholder="Vui lòng ghi rõ lý do nghỉ phép..."
                className="min-h-[100px]"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Hủy bỏ
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Gửi đến HR
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}