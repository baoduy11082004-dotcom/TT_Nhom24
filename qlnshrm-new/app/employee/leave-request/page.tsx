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
  
  // 1. Khởi tạo dữ liệu
  const [user, setUser] = useState({ name: "", id: "", email: "", phone: "", team: "" })
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 2. Lấy dữ liệu user từ LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const realUser = JSON.parse(storedUser)
        // Xử lý tên phòng ban
        const rawTeam = realUser.team_id || realUser.team || "";
        let displayTeam = "Chưa cập nhật";
        switch (rawTeam.toLowerCase()) {
          case 'dev': case 'engineering': displayTeam = "Kỹ thuật (Engineering)"; break;
          case 'design': case 'ui/ux': displayTeam = "Thiết kế (Design)"; break;
          case 'qa': case 'tester': displayTeam = "Kiểm thử (QA)"; break;
          case 'hr': case 'human resources': displayTeam = "Nhân sự (HR)"; break;
          case 'marketing': displayTeam = "Marketing"; break;
          default: displayTeam = rawTeam;
        }
        setUser({
          name: realUser.name || "",
          id: realUser.id || "",
          email: realUser.email || "",
          phone: realUser.phone || "+84 901 234 567", 
          team: displayTeam
        })
      } catch (e) { console.error(e) }
    }
  }, [])

  // --- HÀM GỬI ĐƠN (GỌI API THẬT) ---
  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) {
      alert("Vui lòng điền đầy đủ ngày tháng và lý do!");
      return;
    }

    setIsSubmitting(true)

    try {
      // GỌI API BACKEND
      const res = await fetch('http://localhost:5000/api/leave/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName: user.name,
          team: user.team,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          reason: reason
        })
      });

      if (res.ok) {
        // NẾU THÀNH CÔNG SẼ HIỆN CÂU NÀY (Để phân biệt với code cũ)
        alert("✅ Gửi đơn thành công! HR đã nhận được thông báo.");
        router.push("/employee/dashboard");
      } else {
        const errorData = await res.json();
        alert("❌ Lỗi: " + (errorData.msg || "Server lỗi"));
      }

    } catch (error) {
      console.error(error);
      alert("⚠️ Lỗi kết nối Server Backend! Kiểm tra xem cửa sổ đen có chạy không.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-3xl py-6 mx-auto">
      <Button variant="ghost" className="mb-4 pl-0" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Đơn Xin Nghỉ Phép</CardTitle>
          <CardDescription>Điền thông tin gửi phòng nhân sự.</CardDescription>
        </CardHeader>
        
        {/* Dùng div thay form để tránh lỗi submit */}
        <div className="space-y-6 p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Họ và tên</Label>
                <Input value={user.name} readOnly className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label>Mã nhân viên</Label>
                <Input value={user.id} readOnly className="bg-gray-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input value={user.phone} onChange={(e) => setUser({...user, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Phòng ban</Label>
                <Input value={user.team} readOnly className="bg-gray-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label>Từ ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}
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
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lý do</Label>
              <Textarea placeholder="Ghi rõ lý do..." className="min-h-[100px]" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
                {/* NÚT GỬI THẬT */}
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : <><Send className="mr-2 h-4 w-4" /> Gửi đến HR</>}
                </Button>
            </div>
        </div>
      </Card>
    </div>
  )
}