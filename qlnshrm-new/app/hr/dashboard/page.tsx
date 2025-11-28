"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function HRDashboard() {
  // Mock data for HR Admin
  const admin = {
    name: "Trần Thị B",
    role: "HR Manager",
    department: "Human Resources",
    email: "hr.manager@company.com",
    phone: "+84 909 888 777",
    location: "Hà Nội",
    joinDate: "01/01/2020",
    avatar: "/placeholder.svg",
    id: "HR001",
  };

  const stats = [
    {
      title: "Tổng nhân viên",
      value: "124",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Đang làm việc",
      value: "112",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Nghỉ phép",
      value: "8",
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Đi trễ",
      value: "4",
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Quản Trị
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tổng quan nhân sự và thông tin cá nhân của bạn
          </p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Xuất báo cáo tháng
        </Button>
      </div>

      {/* HR Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Info Card with QR for HR */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-500" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={admin.avatar || "/placeholder.svg"} />
                <AvatarFallback>{admin.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{admin.name}</h3>
              <Badge className="mt-2 bg-purple-600 hover:bg-purple-700">
                {admin.role}
              </Badge>

              {/* QR Code for HR */}
              <div className="mt-6 p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${admin.id}`}
                  alt="HR QR Code"
                  className="w-32 h-32 mb-2"
                />
                <p className="text-xs text-gray-500 font-mono">{admin.id}</p>
                <p className="text-xs text-purple-600 font-medium mt-1">
                  Mã chấm công
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-sm">
                <Briefcase className="w-4 h-4 mr-3 text-gray-500" />
                <div>
                  <p className="text-gray-500 text-xs">Phòng ban</p>
                  <p className="font-medium">{admin.department}</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="w-4 h-4 mr-3 text-gray-500" />
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="font-medium">{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 mr-3 text-gray-500" />
                <div>
                  <p className="text-gray-500 text-xs">Điện thoại</p>
                  <p className="font-medium">{admin.phone}</p>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                <div>
                  <p className="text-gray-500 text-xs">Văn phòng</p>
                  <p className="font-medium">{admin.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions or Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>
              Cập nhật mới nhất từ hệ thống nhân sự
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Nguyễn Văn {String.fromCharCode(64 + i)} vừa chấm công vào
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString()} - Văn phòng Hồ Chí Minh
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
