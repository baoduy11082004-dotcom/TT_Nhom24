"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  User,
  Lock,
  Mail,
  ArrowRight,
  QrCode,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();

  // 1. STATE QUẢN LÝ DỮ LIỆU NHẬP VÀO
  // State cho form Nhân viên
  const [emailEmployee, setEmailEmployee] = useState("");
  const [passwordEmployee, setPasswordEmployee] = useState("");

  // State cho form HR
  const [usernameHr, setUsernameHr] = useState(""); // Trong DB, trường này map với cột 'email'
  const [passwordHr, setPasswordHr] = useState("");

  // State trạng thái
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 2. HÀM XỬ LÝ ĐĂNG NHẬP
  const handleLogin = async (e: React.FormEvent, role: "employee" | "hr") => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Xóa lỗi cũ nếu có

    // Lấy dữ liệu tùy theo tab đang đứng
    const emailPayload = role === "employee" ? emailEmployee : usernameHr;
    const passwordPayload = role === "employee" ? passwordEmployee : passwordHr;

    try {
      // Gọi API Backend (Port 5000)
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailPayload,
          password: passwordPayload,
          role: role,
        }),
      });

      const data = await res.json();

      // Nếu Server trả về lỗi (ví dụ: 400 hoặc 403)
      if (!res.ok) {
        throw new Error(data.msg || "Đăng nhập thất bại. Vui lòng thử lại.");
      }

      // ĐĂNG NHẬP THÀNH CÔNG
      // Lưu token và thông tin user vào bộ nhớ trình duyệt
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Chuyển hướng trang
      if (role === "hr") {
        router.push("/hr/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err: any) {
      // Hiển thị lỗi ra màn hình
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Chào mừng trở lại
          </CardTitle>
          <CardDescription>Đăng nhập vào hệ thống quản lý</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Button
              variant="outline"
              className="w-full mb-4 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20 bg-transparent"
              onClick={() => router.push("/scanner")}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Máy Chấm Công (Quét QR)
            </Button>

            {/* HIỂN THỊ THÔNG BÁO LỖI NẾU CÓ */}
            {error && (
              <Alert
                variant="destructive"
                className="mb-4 bg-red-50 text-red-600 border border-red-200"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs
              defaultValue="employee"
              className="w-full"
              onValueChange={() => setError("")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee">Nhân viên</TabsTrigger>
                <TabsTrigger value="hr">Quản trị nhân sự</TabsTrigger>
              </TabsList>

              {/* === TAB NHÂN VIÊN === */}
              <TabsContent value="employee" className="mt-4">
                <form
                  onSubmit={(e) => handleLogin(e, "employee")}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email-employee">Email công ty</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      {/* Đã gắn value và onChange */}
                      <Input
                        id="email-employee"
                        placeholder="lily.grace@company.com"
                        className="pl-10"
                        required
                        type="email"
                        value={emailEmployee}
                        onChange={(e) => setEmailEmployee(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-employee">Mật khẩu</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      {/* Đã gắn value và onChange */}
                      <Input
                        id="password-employee"
                        type="password"
                        placeholder="••••••••" // Gợi ý: nhập 123456
                        className="pl-10"
                        required
                        value={passwordEmployee}
                        onChange={(e) => setPasswordEmployee(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember-employee" />
                      <label
                        htmlFor="remember-employee"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Đang xử lý..." : "Đăng nhập"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </TabsContent>

              {/* === TAB HR === */}
              <TabsContent value="hr" className="mt-4">
                <form
                  onSubmit={(e) => handleLogin(e, "hr")}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="username-hr">Tên đăng nhập / Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      {/* Đã gắn value và onChange */}
                      <Input
                        id="username-hr"
                        placeholder="admin.hr"
                        className="pl-10"
                        required
                        value={usernameHr}
                        onChange={(e) => setUsernameHr(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-hr">Mật khẩu quản trị</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      {/* Đã gắn value và onChange */}
                      <Input
                        id="password-hr"
                        type="password"
                        placeholder="••••••••" // Gợi ý: nhập 123456
                        className="pl-10"
                        required
                        value={passwordHr}
                        onChange={(e) => setPasswordHr(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember-hr" />
                      <label
                        htmlFor="remember-hr"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang xử lý..." : "Đăng nhập quản trị"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-xs text-gray-500">Hệ thống quản lý nội bộ v1.0</p>
        </CardFooter>
      </Card>
    </div>
  );
}
