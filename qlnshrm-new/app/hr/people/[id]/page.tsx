"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Building,
  Briefcase,
  Clock,
  Phone,
  MapPin,
} from "lucide-react";
// Import Component Lịch mới
import { AttendanceCalendar } from "@/components/attendance-calendar";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Hàm gọi API (được tách ra để tái sử dụng khi cần refresh)
  const fetchData = async () => {
    try {
      // 1. Lấy thông tin user
      const userRes = await fetch(`http://localhost:5000/api/user/${id}`);
      let userData = null;
      if (userRes.ok) userData = await userRes.json();

      // 2. Lấy lịch sử chấm công
      const attendanceRes = await fetch(
        `http://localhost:5000/api/attendance/history/${id}?t=${Date.now()}`
      ); // Thêm t để tránh cache
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

  if (loading) return <div className="p-10 text-center">Đang tải hồ sơ...</div>;
  if (!employee)
    return <div className="p-10 text-center">Không tìm thấy nhân viên.</div>;

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      {/* Nút Back */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
        </Button>
      </div>

      {/* Card Thông tin cá nhân */}
      <Card className="border-none shadow-md bg-gradient-to-r from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
              <AvatarImage
                src={employee.image_url}
                alt={employee.name}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl">
                {employee.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {employee.name}
                  </h1>
                  <p className="text-blue-600 font-semibold text-lg">
                    {employee.role}
                  </p>
                </div>
                <Badge
                  className={employee.is_hr ? "bg-purple-600" : "bg-blue-600"}
                >
                  {employee.is_hr ? "HR Manager" : "Nhân viên chính thức"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300 mt-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 opacity-70" /> {employee.email}
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 opacity-70" /> Team:{" "}
                  <span className="uppercase font-bold">
                    {employee.team_id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 opacity-70" /> ID: {employee.id}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 opacity-70" /> Ca:{" "}
                  {employee.work_start} - {employee.work_end}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="attendance">Bảng chấm công</TabsTrigger>
          <TabsTrigger value="info">Thông tin chi tiết</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6 animate-in fade-in-50">
          <Card>
            <CardHeader>
              <CardTitle>Theo dõi chuyên cần</CardTitle>
            </CardHeader>
            <CardContent>
              {/* SỬ DỤNG COMPONENT LỊCH Ở ĐÂY */}
              <AttendanceCalendar
                data={attendanceData}
                isEditable={true}
                onDataChange={fetchData} // Refresh lại dữ liệu sau khi sửa
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardContent className="p-10 text-center text-gray-500">
              Thông tin hợp đồng, bảo hiểm xã hội... (Đang cập nhật)
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
