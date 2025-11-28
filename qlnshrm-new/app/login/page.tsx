"use client";

import type React from "react";

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
import { Building2, User, Lock, Mail, ArrowRight, QrCode } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent, role: "employee" | "hr") => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    if (role === "hr") {
      router.push("/hr/dashboard");
    } else {
      router.push("/employee/dashboard");
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

            <Tabs defaultValue="employee" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee">Nhân viên</TabsTrigger>
                <TabsTrigger value="hr">Quản trị nhân sự</TabsTrigger>
              </TabsList>

              <TabsContent value="employee" className="mt-4">
                <form
                  onSubmit={(e) => handleLogin(e, "employee")}
                  className="space-y-4"
                >
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

              <TabsContent value="hr" className="mt-4">
                <form
                  onSubmit={(e) => handleLogin(e, "hr")}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="username-hr">Tên đăng nhập / Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="username-hr"
                        placeholder="admin.hr"
                        className="pl-10"
                        required
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
