"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarCheck, MapPin } from "lucide-react";
// Import Component Lịch
import { AttendanceCalendar } from "@/components/attendance-calendar";

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);

  useEffect(() => {
    // 1. Lấy thông tin user từ localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);

      // 2. Gọi API lấy lịch sử chấm công của chính mình
      fetch(
        `http://localhost:5000/api/attendance/history/${
          userData.id
        }?t=${Date.now()}`
      )
        .then((res) => res.json())
        .then((data) => {
          setAttendanceData(data);
        })
        .catch((err) => console.error("Lỗi:", err));
    }
  }, []);

  if (!user) return <div className="p-8">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header Chào mừng */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-blue-100">
            <AvatarImage src={user.image_url} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Xin chào, {user.name} 👋
            </h1>
            <p className="text-gray-500">
              Chúc bạn một ngày làm việc hiệu quả!
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-medium text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" /> {user.work_start} - {user.work_end}
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg text-green-700 font-medium text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {user.team_id?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Khu vực Lịch Chấm Công */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Lịch */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-blue-600" />
                Bảng công tháng này
              </CardTitle>
              <CardDescription>
                Theo dõi trạng thái điểm danh hàng ngày của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Component Lịch (Read Only) */}
              <AttendanceCalendar
                data={attendanceData}
                isEditable={false} // Nhân viên chỉ xem
              />
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Thống kê nhanh */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Số ngày đi làm</span>
                <span className="font-bold text-xl">
                  {attendanceData.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg text-green-700">
                <span>Đúng giờ</span>
                <span className="font-bold text-xl">
                  {attendanceData.filter((x) => x.status === "Đúng giờ").length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg text-yellow-700">
                <span>Đi trễ</span>
                <span className="font-bold text-xl">
                  {attendanceData.filter((x) => x.status === "Đi trễ").length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Quy định chấm công</h3>
              <ul className="text-sm space-y-2 opacity-90 list-disc list-inside">
                <li>
                  Giờ vào làm: <strong>{user.work_start}</strong>
                </li>
                <li>Đi trễ quá 5 phút sẽ bị tính là trễ.</li>
                <li>Nếu quên chấm công, vui lòng liên hệ HR để được hỗ trợ.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
