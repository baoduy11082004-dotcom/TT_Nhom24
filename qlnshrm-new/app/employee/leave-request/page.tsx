"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
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
  const [user, setUser] = useState({ name: "", id: "", email: "", phone: "", team: "" })
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const realUser = JSON.parse(storedUser)
        let displayTeam = realUser.team_id || realUser.team || "Chưa cập nhật";
        if(displayTeam.includes('dev')) displayTeam = "Kỹ thuật (Dev)";
        if(displayTeam.includes('design')) displayTeam = "Thiết kế (Design)";
        
        setUser({
          name: realUser.name || "", id: realUser.id || "", email: realUser.email || "",
          phone: realUser.phone || "", team: displayTeam
        })
      } catch (e) { console.error(e) }
    }
  }, [])

  // --- HÀM GỬI ĐƠN THẬT ---
  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason) {
      alert("Vui lòng điền đầy đủ thông tin!");
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
        // PHẢI THẤY DÒNG NÀY MỚI LÀ CODE MỚI
        alert("✅ Gửi đơn thành công! HR đã nhận được thông báo.");
        router.push("/employee/dashboard");
      } else {
        const err = await res.json();
        alert("❌ Lỗi: " + err.msg);
      }

    } catch (error) {
      console.error(error);
      alert("⚠️ Lỗi kết nối Server! Kiểm tra lại terminal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-3xl py-6 mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/>Quay lại</Button>
      <Card>
        <CardHeader>
          <CardTitle>Đơn Xin Nghỉ Phép</CardTitle>
          <CardDescription>Điền thông tin gửi phòng nhân sự.</CardDescription>
        </CardHeader>
        <div className="space-y-6 p-6 pt-0">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Họ tên</Label><Input value={user.name} readOnly className="bg-gray-100"/></div>
              <div className="space-y-2"><Label>Mã NV</Label><Input value={user.id} readOnly className="bg-gray-100"/></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
               <div className="space-y-2"><Label>Từ ngày</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{startDate ? format(startDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus/></PopoverContent></Popover></div>
               <div className="space-y-2"><Label>Đến ngày</Label><Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{endDate ? format(endDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus/></PopoverContent></Popover></div>
            </div>
            <div className="space-y-2"><Label>Lý do</Label><Textarea value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Nhập lý do..."/></div>
            <CardFooter className="flex justify-end p-0 mt-4">
                <Button variant="outline" className="mr-2" onClick={()=>router.back()}>Hủy bỏ</Button>
                {/* NÚT GỬI THẬT */}
                <Button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : <><Send className="mr-2 h-4 w-4" /> Gửi đến HR</>}
                </Button>
            </CardFooter>
        </div>
      </Card>
    </div>
  )
}