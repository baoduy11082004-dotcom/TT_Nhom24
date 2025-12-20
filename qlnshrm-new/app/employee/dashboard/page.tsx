"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CalendarCheck, MapPin, LogOut, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Import các component con
import { AttendanceCalendar } from "@/components/attendance-calendar";
import { SalarySection } from "@/components/salary-section";

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const { toast } = useToast();

  // Hàm load dữ liệu
  const loadData = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);

      // Gọi API lấy lịch sử chấm công
      fetch(`http://localhost:5000/api/attendance/history/${userData.id}?t=${Date.now()}`)
        .then((res) => res.json())
        .then((data) => {
          setAttendanceData(data);
        })
        .catch((err) => console.error("Lỗi tải dữ liệu chấm công:", err));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Xử lý Check-out (Tan làm)
  const handleCheckout = async () => {
    if (!user) return;
    try {
      const res = await fetch('http://localhost:5000/api/attendance/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast({ title: "Thành công", description: data.msg });
        loadData(); // Load lại dữ liệu để cập nhật bảng lương
      } else {
        toast({ title: "Thất bại", description: data.msg, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Lỗi", description: "Không kết nối được server", variant: "destructive" });
    }
  };

  if (!user) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Nút Check-out */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-blue-100">
                <AvatarImage src={user.image_url} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Xin chào, {user.name} 👋</h1>
                <p className="text-gray-500">Chúc bạn một ngày làm việc hiệu quả!</p>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
             <div className="flex gap-2">
                <Badge variant="outline" className="px-3 py-1 flex gap-2 border-blue-200 text-blue-700 bg-blue-50">
                    <Clock className="h-4 w-4" /> {user.work_start} - {user.work_end}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 flex gap-2 border-green-200 text-green-700 bg-green-50 uppercase">
                    <MapPin className="h-4 w-4" /> {user.team_id}
                </Badge>
             </div>
             
             
             
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Cột Trái: Lịch Chấm Công (Chiếm 2/3) */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md border-none h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-blue-600" />
                        Bảng công tháng này
                    </CardTitle>
                    <CardDescription>Theo dõi trạng thái điểm danh hàng ngày của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                    <AttendanceCalendar 
                        data={attendanceData} 
                        isEditable={false} // Nhân viên chỉ xem
                    />
                </CardContent>
            </Card>
        </div>

        {/* 3. Cột Phải: Thống kê & Tính Lương (Chiếm 1/3) */}
        <div className="space-y-6">
            {/* QUAN TRỌNG: Đã thêm prop employee={user} 
                để SalarySection lấy được base_salary 
            */}
            <SalarySection 
                attendanceData={attendanceData} 
                employee={user} 
            />
            
            {/* Quy định */}
            <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-md">
                <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Clock className="h-5 w-5" /> Quy định chấm công
                    </h3>
                    <ul className="text-sm space-y-2 opacity-90 list-disc list-inside leading-relaxed">
                        <li>Giờ vào làm: <strong>{user.work_start}</strong></li>
                        <li>Giờ tan làm: <strong>17:00</strong></li>
                        <li>Đi trễ quá 5 phút bị tính là <strong>Đi trễ</strong>.</li>
                        <li>Về sớm trước 17:00 bị tính là về sớm.</li>
                        <li>Thưởng chuyên cần: <strong>500k</strong> (Công {'>='} 22 & Không trễ).</li>
                    </ul>
                    
                        <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Quên mật khẩu?</Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}