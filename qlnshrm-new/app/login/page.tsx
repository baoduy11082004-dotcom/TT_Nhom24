"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Quan trọng: Import Link từ next/link
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, User, Lock, Mail, ArrowRight, AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [emailEmployee, setEmailEmployee] = useState("");
  const [passwordEmployee, setPasswordEmployee] = useState("");
  const [usernameHr, setUsernameHr] = useState("");
  const [passwordHr, setPasswordHr] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent, loginType: "employee" | "hr") => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const emailPayload = loginType === "employee" ? emailEmployee : usernameHr;
    const passwordPayload = loginType === "employee" ? passwordEmployee : passwordHr;

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailPayload,
          password: passwordPayload,
          role: loginType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Đăng nhập thất bại.");

      const userData = data.user;
      const isAccountHr = Boolean(userData.is_hr);

      if (loginType === "employee" && isAccountHr) throw new Error("⛔ Tài khoản HR vui lòng sang tab 'Quản trị'.");
      if (loginType === "hr" && !isAccountHr) throw new Error("⛔ Tài khoản Nhân viên vui lòng sang tab 'Nhân viên'.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));

      toast({ title: "Đăng nhập thành công", description: `Xin chào ${userData.name}` });

      if (isAccountHr) router.push("/hr/dashboard");
      else router.push("/employee/dashboard");

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
          <CardTitle className="text-2xl font-bold">Chào mừng trở lại</CardTitle>
          <CardDescription>Đăng nhập vào hệ thống quản lý</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-50 text-red-600 border border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="employee" className="w-full" onValueChange={() => setError("")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee">Nhân viên</TabsTrigger>
                <TabsTrigger value="hr">Quản trị nhân sự</TabsTrigger>
              </TabsList>

              <TabsContent value="employee" className="mt-4">
                <form onSubmit={(e) => handleLogin(e, "employee")} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email công ty</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="nhanvien@company.com" className="pl-10" required type="email" value={emailEmployee} onChange={(e) => setEmailEmployee(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Mật khẩu</Label>
                        <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Quên mật khẩu?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input type="password" placeholder="••••••••" className="pl-10" required value={passwordEmployee} onChange={(e) => setPasswordEmployee(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Đang xử lý..." : "Đăng nhập"}</Button>
                </form>
              </TabsContent>

              <TabsContent value="hr" className="mt-4">
                <form onSubmit={(e) => handleLogin(e, "hr")} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email quản trị</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="admin.hr@company.com" className="pl-10" required value={usernameHr} onChange={(e) => setUsernameHr(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Mật khẩu quản trị</Label>
                        <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Quên mật khẩu?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input type="password" placeholder="••••••••" className="pl-10" required value={passwordHr} onChange={(e) => setPasswordHr(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>{isLoading ? "Đang xử lý..." : "Đăng nhập quản trị"}</Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}