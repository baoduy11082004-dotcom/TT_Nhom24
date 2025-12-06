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

  // State cho form Nhân viên
  const [emailEmployee, setEmailEmployee] = useState("");
  const [passwordEmployee, setPasswordEmployee] = useState("");

  // State cho form HR
  const [usernameHr, setUsernameHr] = useState("");
  const [passwordHr, setPasswordHr] = useState("");

  // State trạng thái
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // HÀM XỬ LÝ ĐĂNG NHẬP
  const handleLogin = async (e: React.FormEvent, loginType: "employee" | "hr") => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Lấy dữ liệu tùy theo tab đang đứng
    const emailPayload = loginType === "employee" ? emailEmployee : usernameHr;
    const passwordPayload = loginType === "employee" ? passwordEmployee : passwordHr;

    try {
      // 1. Gọi API Backend để kiểm tra email/password
      const res = await fetch("http://192.168.2.103:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailPayload,
          password: passwordPayload,
          role: loginType, 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }

      const userData = data.user;
      const isAccountHr = Boolean(userData.is_hr); // Chuyển về true/false cho chắc chắn

      // 2. --- KIỂM TRA KHỚP TAB (LOGIC MỚI) ---
      
      // Trường hợp 1: Đang ở tab NHÂN VIÊN mà dùng tài khoản HR
      if (loginType === "employee" && isAccountHr) {
        throw new Error("⛔ Tài khoản này là Quản trị (HR). Vui lòng chuyển sang tab 'Quản trị nhân sự' để đăng nhập.");
      }

      // Trường hợp 2: Đang ở tab HR mà dùng tài khoản NHÂN VIÊN
      if (loginType === "hr" && !isAccountHr) {
        throw new Error("⛔ Tài khoản này là Nhân viên thường. Vui lòng chuyển sang tab 'Nhân viên' để đăng nhập.");
      }

      // 3. Nếu đúng Tab -> Tiến hành lưu và chuyển trang
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      if (isAccountHr) {
        router.push("/hr/dashboard");
      } else {
        router.push("/employee/dashboard");
      }

    } catch (err: any) {
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

            {/* Khu vực hiển thị lỗi */}
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
              onValueChange={() => setError("")} // Xóa lỗi khi chuyển tab
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee">Nhân viên</TabsTrigger>
                <TabsTrigger value="hr">Quản trị nhân sự</TabsTrigger>
              </TabsList>

              {/* === TAB NHÂN VIÊN === */}
              <TabsContent value="employee" className="mt-4">
                <form onSubmit={(e) => handleLogin(e, "employee")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-employee">Email công ty</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email-employee"
                        placeholder="nhanvien@company.com"
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
                      <Input
                        id="password-employee"
                        type="password"
                        placeholder="••••••••"
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
                      <label htmlFor="remember-employee" className="text-sm cursor-pointer">Ghi nhớ đăng nhập</label>
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
                <form onSubmit={(e) => handleLogin(e, "hr")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username-hr">Email quản trị</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="username-hr"
                        placeholder="admin.hr@company.com"
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
                      <Input
                        id="password-hr"
                        type="password"
                        placeholder="••••••••"
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
                      <label htmlFor="remember-hr" className="text-sm cursor-pointer">Ghi nhớ đăng nhập</label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
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