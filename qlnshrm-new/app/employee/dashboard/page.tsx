"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AttendanceHistory, type AttendanceRecord } from "@/components/attendance-history"
import { Calendar, Clock, DollarSign, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function EmployeeDashboard() {
  const router = useRouter()
  const [employee, setEmployee] = useState<any>({ name: "Đang tải...", salary: { month: "12/2025" } });
  const [projects, setProjects] = useState<any[]>([]); 
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // --- HÀM TẠO DỮ LIỆU CHẤM CÔNG KẾT HỢP NGÀY NGHỈ ---
  const generateAttendanceData = (year: number, month: number, approvedLeaves: any[]) => {
    const days = new Date(year, month + 1, 0).getDate()
    const records: AttendanceRecord[] = []
    
    for (let i = 1; i <= days; i++) {
      const currentDate = new Date(year, month, i);
      const dayOfWeek = currentDate.getDay();
      
      // Bỏ qua T7, CN
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      let status: "on-time" | "late" | "absent" | "leave" = "on-time";
      let checkIn: string | undefined = "08:00";

      // 1. KIỂM TRA NGÀY NGHỈ ĐÃ DUYỆT
      // approvedLeaves là mảng chứa { start_date, end_date } từ API
      const isLeaveDay = approvedLeaves.some(leave => {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        
        // Chuẩn hóa giờ về 00:00:00 để so sánh ngày
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        currentDate.setHours(0,0,0,0);
        
        return currentDate >= start && currentDate <= end;
      });

      if (isLeaveDay) {
        status = "leave"; 
        checkIn = "Nghỉ phép";
      } else {
        // Random dữ liệu đi làm cho những ngày không nghỉ
        const random = Math.random();
        if (random > 0.95) { status = "absent"; checkIn = undefined; }
        else if (random > 0.85) { status = "late"; checkIn = "08:35"; }
      }

      records.push({ 
        date: new Date(year, month, i), 
        status: status as any, 
        checkIn 
      })
    }
    return records;
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const userReal = JSON.parse(storedUser)
        setEmployee(userReal);

        if (userReal.id) {
          // 1. Lấy Dự án
          fetch(`http://localhost:5000/api/projects/my-projects?userId=${userReal.id}`)
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(e => console.error(e));

          // 2. Lấy Ngày nghỉ ĐÃ DUYỆT -> Tạo lịch
          fetch(`http://localhost:5000/api/leave/my-approved?userId=${userReal.id}`)
            .then(res => res.json())
            .then(approvedLeaves => {
                // Tạo dữ liệu tháng 12/2025 (Bạn có thể đổi tháng theo ý muốn)
                const data = generateAttendanceData(2025, 11, approvedLeaves); 
                setAttendanceRecords(data);
            })
            .catch(e => console.error(e));
        }
      } catch (e) { console.error(e) }
    }
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Xin chào, {employee.name} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Chúc bạn một ngày làm việc hiệu quả!</p>
        </div>
        <Button onClick={() => router.push("/employee/leave-request")} className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="w-4 h-4 mr-2" /> Xin nghỉ phép
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* LỊCH SỬ CHẤM CÔNG */}
          <AttendanceHistory records={attendanceRecords} />
          
          {/* DỰ ÁN */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                Dự án đang tham gia
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Bạn chưa tham gia dự án nào.</p>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-white">{project.role}</Badge>
                          <span className="text-xs text-gray-500">
                            Tham gia: {new Date(project.joined_at).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <Badge className={project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}>
                        {project.status === 'IN_PROGRESS' ? 'Đang thực hiện' : project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CỘT PHẢI */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center text-base"><Clock className="w-4 h-4 mr-2 text-green-500" /> Thống kê tháng này</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-500">Ngày công thực tế</span>
                   <span className="font-bold text-lg">{attendanceRecords.filter(r => r.status === 'on-time' || r.status === 'late').length}</span>
               </div>
               <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-500">Số ngày nghỉ phép</span>
                   {/* Đếm số ngày nghỉ */}
                   <span className="font-bold text-lg text-purple-600">{attendanceRecords.filter(r => r.status === 'leave').length}</span>
               </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-white"><DollarSign className="w-5 h-5 mr-2 opacity-80" /> Thu nhập ước tính</CardTitle>
              <CardDescription className="text-blue-100">Tháng 12/2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">29.000.000 ₫</div>
              <p className="text-sm text-blue-100 opacity-80">Đã bao gồm thưởng & phụ cấp</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}