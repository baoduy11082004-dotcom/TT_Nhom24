"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, ArrowLeft, Send } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function LeaveRequestPage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock submission
    alert("Đơn xin nghỉ phép đã được gửi đến HR!")
    router.push("/employee/dashboard")
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:pl-2 transition-all"
        onClick={() => router.push("/employee/dashboard")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Đơn Xin Nghỉ Phép</CardTitle>
          <CardDescription>Vui lòng điền đầy đủ thông tin bên dưới để gửi yêu cầu đến phòng nhân sự.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input id="fullName" placeholder="Nguyễn Văn A" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Mã nhân viên</Label>
                <Input id="employeeId" placeholder="NV001" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" placeholder="0901234567" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Phòng ban</Label>
                <Input id="department" placeholder="Kỹ thuật" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Từ ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
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
              <div className="space-y-2">
                <Label>Đến ngày</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
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

            <div className="space-y-2">
              <Label htmlFor="reason">Lý do nghỉ phép</Label>
              <Textarea
                id="reason"
                placeholder="Vui lòng ghi rõ lý do nghỉ phép..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/employee/dashboard")}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Gửi đến HR
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
