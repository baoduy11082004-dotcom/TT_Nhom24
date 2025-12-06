"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AttendanceHistory, type AttendanceRecord } from "@/components/attendance-history";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  FileDown,
  Trash2,
  Edit,
  User as UserIcon
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// 1. Định nghĩa kiểu dữ liệu User trả về từ API
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  team_id: string;
  image_url: string;
  bio: string;
  // Các trường này chưa có trong DB, tạm thời để optional
  dob?: string;
  join_date?: string;
  address?: string;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // 2. Lấy dữ liệu nhân viên từ API
  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/user/profile/${personId}?_t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error("Không tìm thấy nhân viên");
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      } finally {
        setLoading(false);
      }
    };

    if (personId) {
      fetchUserDetail();
      // Tạo dữ liệu chấm công giả lập (vì chưa có API chấm công thật)
      setAttendanceRecords(generateMockAttendance(2025, 10)); 
    }
  }, [personId]);

  // Hàm tạo dữ liệu chấm công giả (Giữ nguyên logic cũ để hiển thị UI)
  // Hàm tạo dữ liệu chấm công giả (Đã bỏ giới hạn ngày 20)
  // Hàm tạo dữ liệu chấm công giả (Full tháng, bao gồm T7, CN)
  const generateMockAttendance = (year: number, month: number): AttendanceRecord[] => {
    // Lấy tổng số ngày trong tháng (tháng 10 là 31 ngày, tháng 1 là 28 ngày...)
    const days = new Date(year, month + 1, 0).getDate();
    const records: AttendanceRecord[] = [];
    
    for (let i = 1; i <= days; i++) {
      const date = new Date(year, month, i);
      const dayOfWeek = date.getDay();
      
      // Mặc định trạng thái
      let status: "on-time" | "late" | "absent" | "leave" | "weekend" = "on-time";
      let checkIn: string | undefined = "08:00";

      // Nếu là Chủ Nhật (0) hoặc Thứ 7 (6) -> Đánh dấu là cuối tuần
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = "weekend";
        checkIn = "--"; 
      } else {
        // Random dữ liệu cho ngày thường
        const random = Math.random();
        if (random > 0.85) { status = "late"; checkIn = "08:45"; } 
        else if (random > 0.95) { status = "absent"; checkIn = ""; }
      }

      records.push({
        date,
        status: status as any,
        checkIn: status === "absent" ? undefined : checkIn,
      });
    }
    return records;
  };
  // Helper: Mapping tên phòng ban
  const getTeamName = (teamId: string = "") => {
    const map: Record<string, string> = {
      'hr': 'Human Resources',
      'dev': 'Engineering',
      'design': 'Design',
      'qa': 'Quality Assurance',
      'marketing': 'Marketing'
    };
    return map[teamId.toLowerCase()] || teamId.toUpperCase();
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Đang tải thông tin nhân viên...</div>;
  }

  if (!user) {
    return <div className="p-6 text-center text-red-500">Không tìm thấy nhân viên này!</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 pl-0 hover:pl-2 transition-all"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hồ sơ nhân viên</h1>
            <p className="text-gray-500 text-sm">Quản lý thông tin chi tiết và lịch sử làm việc</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <FileDown className="w-4 h-4 mr-2" /> Xuất hồ sơ
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 h-fit shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle>Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center mb-6 text-center">
              <Avatar className="w-32 h-32 mb-4 border-4 border-gray-100">
                <AvatarImage src={user.image_url || "/placeholder.svg"} className="object-cover" />
                <AvatarFallback className="text-4xl bg-blue-100 text-blue-600">
                    {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-gray-500 font-medium">{user.role || "Nhân viên"}</p>
              
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                    {getTeamName(user.team_id)}
                </Badge>
                <Badge variant="outline" className="text-gray-500">
                    {user.id}
                </Badge>
              </div>
            </div>

            <div className="space-y-5 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-3 text-sm">
                <div className="p-2 bg-gray-100 rounded-full dark:bg-gray-800"><Mail className="w-4 h-4 text-gray-600" /></div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase">Email</p>
                  <p className="font-medium text-gray-900 dark:text-gray-200">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-sm">
                <div className="p-2 bg-gray-100 rounded-full dark:bg-gray-800"><Phone className="w-4 h-4 text-gray-600" /></div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase">Số điện thoại</p>
                  <p className="font-medium text-gray-900 dark:text-gray-200">{user.phone || "Chưa cập nhật"}</p>
                </div>
              </div>

              {/* Các trường chưa có trong DB thì hiển thị mặc định */}
              <div className="flex items-center space-x-3 text-sm">
                <div className="p-2 bg-gray-100 rounded-full dark:bg-gray-800"><Calendar className="w-4 h-4 text-gray-600" /></div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase">Ngày sinh</p>
                  <p className="font-medium text-gray-900 dark:text-gray-200">{user.dob || "Chưa cập nhật"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-sm">
                <div className="p-2 bg-gray-100 rounded-full dark:bg-gray-800"><MapPin className="w-4 h-4 text-gray-600" /></div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase">Địa chỉ</p>
                  <p className="font-medium text-gray-900 dark:text-gray-200">{user.address || "Chưa cập nhật"}</p>
                </div>
              </div>
              
              {user.bio && (
                <div className="pt-2">
                    <p className="text-gray-500 text-xs font-medium uppercase mb-1">Giới thiệu</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">"{user.bio}"</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" className="flex-1 border-gray-300" onClick={() => alert("Tính năng chỉnh sửa đang phát triển")}>
                <Edit className="w-4 h-4 mr-2" /> Sửa
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none">
                    <Trash2 className="w-4 h-4 mr-2" /> Xóa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa nhân viên?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn đang thao tác xóa <strong>{user.name}</strong>. Hành động này không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700">Xóa vĩnh viễn</AlertDialogAction>
                  <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Cột phải: Lịch sử chấm công */}
        <div className="lg:col-span-2 space-y-6">
          <AttendanceHistory records={attendanceRecords} />
          
          {/* Có thể thêm các Card khác như Dự án, KPI ở đây */}
          <Card>
             <CardHeader><CardTitle>Dự án đang tham gia</CardTitle></CardHeader>
             <CardContent>
                <p className="text-gray-500 text-sm italic">Chưa có dữ liệu dự án.</p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}