"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Building, Briefcase, DollarSign } from "lucide-react";
import { AttendanceCalendar } from "@/components/attendance-calendar";
import { SalarySection } from "@/components/salary-section";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // STATE MỚI: Quản lý tháng đang xem (Mặc định là hôm nay)
  const [viewDate, setViewDate] = useState(new Date());

  const fetchData = async () => {
    try {
      const userRes = await fetch(`http://localhost:5000/api/user/${id}`);
      let userData = null;
      if (userRes.ok) userData = await userRes.json();

      // Thêm timestamp để tránh cache
      const attendanceRes = await fetch(`http://localhost:5000/api/attendance/history/${id}?t=${Date.now()}`);
      const attendanceList = await attendanceRes.json();

      setEmployee(userData);
      setAttendanceData(attendanceList);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="p-10 text-center animate-pulse">Đang tải hồ sơ...</div>;
  if (!employee) return <div className="p-10 text-center text-red-500">Không tìm thấy nhân viên.</div>;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
        </Button>
      </div>

      <Card className="border-none shadow-md bg-gradient-to-r from-blue-50 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarImage src={employee.image_url} alt={employee.name} className="object-cover" />
              <AvatarFallback className="text-2xl">{employee.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{employee.name}</h1>
                  <p className="text-blue-600 font-semibold">{employee.position || "Nhân viên"}</p>
                </div>
                <Badge className={employee.is_hr ? "bg-purple-600" : "bg-blue-600"}>
                  {employee.is_hr ? "HR Admin" : "Nhân viên"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 opacity-70"/> {employee.email}</div>
                <div className="flex items-center gap-2"><Building className="h-4 w-4 opacity-70"/> Phòng ban: <span className="font-semibold">{employee.department}</span></div>
                <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 opacity-70"/> ID: {employee.id}</div>
                <div className="flex items-center gap-2 text-green-600 font-medium">
                    <DollarSign className="h-4 w-4" /> 
                    Lương cứng: {new Intl.NumberFormat('vi-VN').format(employee.salary || 0)} VNĐ
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="attendance">Bảng công & Lương</TabsTrigger>
          <TabsTrigger value="info">Hồ sơ chi tiết</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6 animate-in fade-in-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cột Lớn: Lịch Chấm Công */}
            <div className="lg:col-span-2">
                 <Card className="h-full shadow-sm">
                    <CardHeader>
                        <CardTitle>Chi tiết chấm công</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* TRUYỀN VIEWDATE VÀO ĐÂY */}
                        <AttendanceCalendar 
                            data={attendanceData} 
                            userId={id} 
                            isEditable={true} 
                            onDataChange={fetchData}
                            currentDate={viewDate}        // <-- Nhận ngày từ cha
                            onDateChange={setViewDate}    // <-- Cập nhật ngày cho cha
                        />
                    </CardContent>
                 </Card>
            </div>

            {/* Cột Nhỏ: Bảng Tính Lương */}
            <div className="space-y-6">
                 {/* TRUYỀN VIEWDATE VÀO ĐÂY ĐỂ TÍNH LƯƠNG ĐÚNG THÁNG */}
                 <SalarySection 
                    attendanceData={attendanceData} 
                    employee={employee}
                    viewDate={viewDate} // <-- Lương sẽ tính theo tháng này
                 />
                 
                 <Card className="bg-blue-50 border-blue-100 border">
                    <CardContent className="p-4 text-center text-blue-600 text-sm">
                        <p>💡 <strong>Gợi ý:</strong> Dữ liệu lương được tính tự động theo tháng bạn đang xem trên lịch.</p>
                    </CardContent>
                 </Card>
            </div>
            
          </div>
        </TabsContent>

        <TabsContent value="info">
           <Card>
             <CardContent className="p-10 text-center text-gray-500 italic">
               Tính năng quản lý hồ sơ chi tiết đang cập nhật...
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}