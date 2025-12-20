"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar, User, MapPin, Phone, Mail, Briefcase, Users,
  FileText, CheckCircle2, AlertCircle, QrCode, LogOut, ScanLine, Loader2, RefreshCw
} from "lucide-react"

export default function HRDashboard() {
  const router = useRouter()
  const [loadingUser, setLoadingUser] = useState(true);

  // STATE QUẢN LÝ DỮ LIỆU ADMIN (HR)
  const [admin, setAdmin] = useState({
    name: "Đang tải...",
    role: "HR Manager",
    department: "Human Resources",
    email: "hr@company.com",
    phone: "Chưa cập nhật",
    location: "Hồ Chí Minh",
    joinDate: "01/01/2020",
    avatar: "/placeholder.svg",
    id: "HR001",
  })

  // STATE THỐNG KÊ (DỮ LIỆU THẬT)
  const [activities, setActivities] = useState<any[]>([]) 
  const [statsData, setStatsData] = useState({
    total: 0,
    working: 0,
    onLeave: 0,
    late: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // --- HÀM 1: LẤY THÔNG TIN ADMIN MỚI NHẤT TỪ API ---
  const fetchAdminProfile = async (userId: string) => {
    try {
        setLoadingUser(true);
        // Gọi API lấy chi tiết user (tránh dùng localStorage cũ)
        const res = await fetch(`http://localhost:5000/api/user/${userId}`);
        if (res.ok) {
            const data = await res.json();
            setAdmin(prev => ({
                ...prev,
                name: data.name || prev.name,
                email: data.email || prev.email,
                role: data.role || prev.role,
                id: data.id || userId,
                avatar: data.image_url || "/placeholder.svg",
                phone: data.phone || "Chưa cập nhật",
                location: "Hồ Chí Minh" // Nếu DB có cột location thì thay vào đây
            }));
        }
    } catch (error) {
        console.error("Lỗi tải thông tin Admin:", error);
    } finally {
        setLoadingUser(false);
    }
  };

  // --- HÀM 2: LẤY THÔNG BÁO ---
  const fetchActivities = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leave/notifications?role=hr')
      if (res.ok) {
        const data = await res.json()
        // Chỉ lấy 10 thông báo mới nhất
        setActivities(Array.isArray(data) ? data.slice(0, 10) : [])
      }
    } catch (err) { console.error("Lỗi thông báo:", err) }
  }

  // --- HÀM 3: LẤY SỐ LIỆU THỐNG KÊ ---
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('http://localhost:5000/api/attendance/stats/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStatsData({
          total: data.total || 0,
          working: data.working || 0,
          onLeave: data.onLeave || 0,
          late: data.late || 0
        });
      }
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    // 1. Kiểm tra đăng nhập
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
        router.push("/login"); // Nếu chưa đăng nhập thì đá về login
        return;
    }

    // 2. Lấy ID từ localStorage để gọi API
    try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.id) {
            fetchAdminProfile(parsedUser.id);
        }
    } catch (e) { console.error(e) }

    // 3. Gọi dữ liệu Dashboard
    fetchActivities();
    fetchStats();

    // Refresh tự động mỗi 30s
    const interval = setInterval(() => {
       fetchStats();
    }, 30000);
    
    return () => clearInterval(interval)
  }, [router]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
  }

  // Cấu hình Cards hiển thị
  const stats = [
    { 
      title: "Tổng nhân viên", 
      value: loadingStats ? "..." : statsData.total, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-100" 
    },
    { 
      title: "Đang làm việc", 
      value: loadingStats ? "..." : statsData.working, 
      icon: CheckCircle2, 
      color: "text-green-600", 
      bg: "bg-green-100" 
    },
    { 
      title: "Nghỉ phép", 
      value: loadingStats ? "..." : statsData.onLeave, 
      icon: Calendar, 
      color: "text-purple-600", 
      bg: "bg-purple-100" 
    },
    { 
      title: "Đi trễ (Hôm nay)", 
      value: loadingStats ? "..." : statsData.late, 
      icon: AlertCircle, 
      color: "text-orange-600", 
      bg: "bg-orange-100" 
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Quản Trị</h1>
          <p className="text-gray-600 dark:text-gray-400">Số liệu thực tế hôm nay</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => { fetchStats(); fetchActivities(); }}>
                <RefreshCw className="w-4 h-4" />
            </Button>
            <Button>
            <FileText className="w-4 h-4 mr-2" />
            Xuất báo cáo
            </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                {loadingStats ? <Loader2 className="w-6 h-6 animate-spin" /> : <stat.icon className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CỘT 1: THÔNG TIN ADMIN & MÃ QR */}
        <Card className="md:col-span-1 border-blue-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
           <CardHeader>
            <CardTitle className="flex items-center text-gray-800"><User className="w-5 h-5 mr-2" /> Thông tin của bạn</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {loadingUser ? (
                <div className="py-10 flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                    <p className="text-sm text-gray-400">Đang tải hồ sơ...</p>
                </div>
            ) : (
                <>
                    <Avatar className="w-24 h-24 mb-3 border-4 border-white shadow-lg">
                        <AvatarImage src={admin.avatar} />
                        <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-gray-800 text-center">{admin.name}</h3>
                    <Badge variant="secondary" className="mb-6 mt-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {admin.role}
                    </Badge>

                    <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mã QR Cá Nhân</span>
                        <div className="bg-white p-2 rounded-lg border shadow-sm">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${admin.id}`}
                                alt="HR QR Code"
                                className="w-28 h-28"
                            />
                        </div>
                        <code className="text-sm font-mono font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded">{admin.id}</code>
                    </div>
                </>
            )}
          </CardContent>
        </Card>

        {/* CỘT 2: MÁY CHẤM CÔNG */}
        <Card className="md:col-span-1 shadow-sm flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <QrCode className="w-5 h-5 mr-2" />
              Công cụ chấm công
            </CardTitle>
            <CardDescription>Mở camera để quét mã QR cho nhân viên</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-2">
                <p className="text-sm text-blue-800">
                    💡 <strong>Mẹo:</strong> Sử dụng tablet hoặc điện thoại đặt tại cửa ra vào để làm máy chấm công cố định.
                </p>
            </div>

            <Button 
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
              onClick={() => router.push('/scanner')} 
            >
              <ScanLine className="mr-2 h-6 w-6" /> Quét Check-in (Vào)
            </Button>

            <Button 
              variant="outline"
              className="w-full h-14 text-lg text-orange-600 border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 shadow-sm transition-all active:scale-95"
              onClick={() => router.push('/scanner?mode=checkout')} 
            >
              <LogOut className="mr-2 h-6 w-6" /> Quét Check-out (Ra)
            </Button>
          </CardContent>
        </Card>

        {/* CỘT 3: THÔNG BÁO */}
        <Card className="md:col-span-1 shadow-sm flex flex-col h-[500px] md:h-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Thông báo mới
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-hidden flex-1 relative">
             <div className="absolute inset-0 px-6 pb-6 overflow-y-auto space-y-3">
              {activities.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Mail className="w-10 h-10 mb-2 opacity-20" />
                    <p>Chưa có thông báo nào.</p>
                </div>
              ) : (
                activities.map((item: any) => (
                  <div 
                    key={item.id} 
                    className="flex gap-3 text-sm p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 transition-colors cursor-pointer group"
                    onClick={() => router.push('/hr/leave-requests')}
                  >
                    <div className="mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 leading-snug">{item.message}</p>
                      <span className="text-xs text-gray-400 mt-1 block">{formatTime(item.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}