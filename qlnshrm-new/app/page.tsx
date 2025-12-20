"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Kiểm tra token trong localStorage
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      // 2. Nếu chưa đăng nhập -> Đẩy về Login ngay lập tức
      router.replace("/login");
    } else {
      // 3. Nếu đã đăng nhập -> Đẩy về Dashboard theo quyền
      try {
        const user = JSON.parse(userStr);
        if (user.is_hr) {
          router.replace("/hr/dashboard");
        } else {
          router.replace("/employee/dashboard");
        }
      } catch (e) {
        router.replace("/login");
      }
    }
  }, [router]);

  // 4. Hiển thị màn hình trắng (hoặc chữ Đang tải) để che giao diện cũ
  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
      <p className="text-gray-500 animate-pulse">Đang kiểm tra đăng nhập...</p>
    </div>
  );
}
