"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";

// Tách Form ra component con để dùng Suspense (Bắt buộc trong Next.js khi dùng useSearchParams)
function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Lấy token từ URL
  const router = useRouter();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu
  const [loading, setLoading] = useState(false);

  // Xử lý khi nhấn nút Đổi mật khẩu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate cơ bản
    if (password.length < 6) {
        toast({ title: "Mật khẩu quá ngắn", description: "Vui lòng nhập tối thiểu 6 ký tự", variant: "destructive" });
        return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Gọi API Backend
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast({ 
            title: "Thành công", 
            description: "Đổi mật khẩu thành công! Đang chuyển hướng...", 
            className: "bg-green-600 text-white border-none" 
        });
        // Chuyển về trang login sau 2 giây
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast({ title: "Thất bại", description: data.msg || "Link đã hết hạn hoặc không hợp lệ.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Lỗi Server", description: "Không thể kết nối đến Backend (Port 5000)", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Giao diện khi Link bị lỗi (Không có token)
  if (!token) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
                <h3 className="font-bold text-red-600 text-lg">Đường dẫn không hợp lệ</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    Link này có thể đã hết hạn hoặc bị sai. Vui lòng yêu cầu cấp lại link mới.
                </p>
            </div>
            <Link href="/forgot-password">
                <Button variant="outline">Gửi lại yêu cầu</Button>
            </Link>
        </div>
      );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
        <div className="relative">
            <Input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Tối thiểu 6 kí tự ..."
                className="h-11 pr-10"
                required
            />
            {/* Nút con mắt ẩn/hiện */}
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
            >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
        <Input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder="Xác nhận mật khẩu..."
            className="h-11"
            required
        />
      </div>

      <Button type="submit" className="w-full h-11 bg-green-600 hover:bg-green-700 text-base mt-2 shadow-sm" disabled={loading}>
        {loading ? <Loader2 className="animate-spin mr-2" /> : <><CheckCircle2 className="mr-2 w-4 h-4"/> Xác nhận đổi</>}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Đặt lại mật khẩu</CardTitle>
          <CardDescription>Tạo mật khẩu mới để bảo vệ tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Suspense để tránh lỗi build khi dùng useSearchParams */}
          <Suspense fallback={<div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>}>
            <ResetForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}