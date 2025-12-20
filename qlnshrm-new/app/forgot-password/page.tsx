"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link"; // Đảm bảo import từ next/link

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        toast({ title: "Lỗi", description: "Vui lòng nhập email", variant: "destructive" });
        return;
    }

    setLoading(true);
    try {
      // Gọi xuống Backend port 5000
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast({ 
            title: "Thành công!", 
            description: "Đã gửi mail. Hãy kiểm tra hộp thư (cả mục Spam/Mailinator).", 
            className: "bg-green-600 text-white border-none" 
        });
      } else {
        toast({ title: "Thất bại", description: data.msg || "Có lỗi xảy ra", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Lỗi Server", description: "Không kết nối được Backend (Port 5000)", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Quên mật khẩu?</CardTitle>
          <CardDescription>
            Nhập email để nhận link đặt lại mật khẩu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email nhân viên</label>
                <Input 
                  type="email" 
                  placeholder="vidu: nhanvien@mailinator.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
            </div>

            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Gửi yêu cầu"}
            </Button>
            
            <div className="text-center pt-2">
                <Link href="/login" className="text-sm text-gray-500 hover:text-blue-600 flex items-center justify-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Quay lại Đăng nhập
                </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}