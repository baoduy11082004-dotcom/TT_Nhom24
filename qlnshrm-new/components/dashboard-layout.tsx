"use client"

import React, { useState, useEffect } from "react"
import { Search, Bell, Settings, HelpCircle, Users, Clock, LogOut, type LucideIcon, User } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavItem {
  name: string
  icon: LucideIcon
  path: string
}

interface UserInfo {
  name: string
  email: string
  role: string
  imageURL: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems?: NavItem[]
  currentUser?: UserInfo
}

export default function DashboardLayout({ children, navItems, currentUser }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<any[]>([])
  
  // Xác định role hiện tại
  const isHR = pathname.startsWith("/hr");
  const currentRole = isHR ? 'hr' : 'employee';

  // API lấy thông báo tự động (5 giây/lần)
  useEffect(() => {
    // Lấy ID người dùng từ localStorage để lọc thông báo riêng
    const storedUser = localStorage.getItem("user");
    let userId = "";
    if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userId = parsed.id;
    }

    const fetchNotis = async () => {
      try {
        // Gửi kèm userId để Backend lọc đúng tin nhắn của người đó
        const res = await fetch(`http://localhost:5000/api/leave/notifications?role=${currentRole}&userId=${userId}`)
        if (res.ok) {
            const data = await res.json()
            setNotifications(data)
        }
      } catch (e) { console.error(e) }
    }
    
    fetchNotis(); // Gọi ngay lần đầu
    const interval = setInterval(fetchNotis, 5000); // Lặp lại mỗi 5 giây
    return () => clearInterval(interval);
  }, [currentRole])

  const defaultUser = { name: "User", email: "user@example.com", role: "Employee", imageURL: "/placeholder.svg" }
  const user = currentUser || defaultUser

  // Sidebar Items
  const defaultSidebarItems = [ { name: "Nhân sự", icon: Users, path: "/people" }, { name: "Chấm công", icon: Clock, path: "/timekeeping" } ]
  const sidebarItems = navItems || defaultSidebarItems
  const settingsBasePath = isHR ? "/hr/settings" : "/employee/settings"

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r flex flex-col p-4">
        <h1 className="text-xl font-bold mb-6 px-2">Mondays</h1>
        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button key={item.name} onClick={() => router.push(item.path)} className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === item.path ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}>
              <item.icon className="w-4 h-4 mr-3" />{item.name}
            </button>
          ))}
        </nav>
        
        <div className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
           <div className="space-y-1">
            <button onClick={() => router.push(`${settingsBasePath}/profile`)} className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800"><Settings className="w-4 h-4 mr-3" />Settings</button>
            <button onClick={() => router.push("/help")} className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800">
                <HelpCircle className="w-4 h-4 mr-3" />Help & Support
                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">8</Badge>
            </button>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search..." className="pl-10 w-80 bg-gray-50 border-none focus-visible:ring-1" />
             </div>
             <span className="text-sm text-gray-400">⌘ F</span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* --- CHUÔNG THÔNG BÁO --- */}
            <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0 shadow-lg">
                  <div className="p-4 font-semibold border-b flex justify-between items-center">
                      <span>Thông báo ({notifications.length})</span>
                      <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-blue-600">Đánh dấu đã đọc</Button>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                    {notifications.length === 0 ? <p className="text-center text-sm text-gray-500 py-8">Không có thông báo mới</p> : 
                     notifications.map((n) => {
                        // --- LOGIC MÀU SẮC THÔNG BÁO ---
                        const isRejected = n.message.includes("TỪ CHỐI") || n.message.includes("❌");
                        const isApproved = n.message.includes("CHẤP NHẬN") || n.message.includes("DUYỆT") || n.message.includes("✅");
                        
                        let bgClass = "bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100"; // Mặc định (HR nhận đơn)
                        let iconColor = "bg-blue-500";

                        if (isRejected) {
                            bgClass = "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 border-l-4 border-red-500";
                            iconColor = "bg-red-500";
                        } else if (isApproved) {
                            bgClass = "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 border-l-4 border-green-500";
                            iconColor = "bg-green-500";
                        }

                        return (
                           <div key={n.id} 
                                className={`p-3 rounded-lg text-sm cursor-pointer transition-colors relative group ${bgClass}`}
                                // CLICK VÀO THÔNG BÁO -> CHUYỂN TRANG
                                onClick={() => {
                                    if (isHR) router.push('/hr/leave-requests'); // HR -> Trang duyệt
                                    else router.push('/employee/dashboard'); // NV -> Trang xem kết quả
                                }}
                           >
                             <div className="flex gap-3">
                                <div className={`mt-1 min-w-[8px] h-2 w-2 rounded-full ${iconColor}`}></div>
                                <div>
                                    <p className="text-gray-800 dark:text-gray-200 font-medium line-clamp-3">{n.message}</p>
                                    <span className="text-xs text-gray-400 mt-1 block">{new Date(n.created_at).toLocaleString('vi-VN')}</span>
                                </div>
                             </div>
                           </div>
                        )
                     })}
                  </div>
                </PopoverContent>
            </Popover>

            {/* Avatar User */}
            <Popover>
                <PopoverTrigger asChild>
                    <Avatar className="cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all">
                        <AvatarImage src={user.imageURL} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2">
                    <div className="px-2 py-1.5 mb-1">
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Separator className="mb-1"/>
                    <Button variant="ghost" className="w-full justify-start h-9 px-2 text-sm" onClick={()=>router.push(`${settingsBasePath}/profile`)}><User className="mr-2 h-4 w-4"/> Hồ sơ cá nhân</Button>
                    <Button variant="ghost" className="w-full justify-start h-9 px-2 text-sm" onClick={()=>router.push(`${settingsBasePath}/account`)}><Settings className="mr-2 h-4 w-4"/> Tài khoản</Button>
                    <Separator className="my-1"/>
                    <Button variant="ghost" className="w-full justify-start h-9 px-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50" 
                        onClick={()=>{
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            router.push('/login');
                        }}>
                        <LogOut className="mr-2 h-4 w-4"/> Đăng xuất
                    </Button>
                </PopoverContent>
            </Popover>
          </div>
        </header>
        
        {/* Nội dung trang thay đổi ở đây */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">{children}</div>
      </div>
    </div>
  )
}