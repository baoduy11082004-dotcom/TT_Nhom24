"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner"; // Thư viện quét mã
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Hook thông báo của bạn

export default function ScannerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(true);
  const [lastResult, setLastResult] = useState<any>(null);

  // Hàm xử lý khi quét được mã
  const handleScan = async (detectedCodes: any) => {
    // Thư viện trả về mảng, lấy phần tử đầu tiên
    const rawValue = detectedCodes[0]?.rawValue;

    if (rawValue && isScanning) {
      setIsScanning(false); // Tạm dừng quét để xử lý

      try {
        // Gọi API Backend
        const res = await fetch("http://localhost:5000/api/attendance/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: rawValue }), // Gửi mã QR (User ID)
        });

        const data = await res.json();

        if (res.ok) {
          // --- KỊCH BẢN THÀNH CÔNG ---
          setLastResult({ type: "success", ...data });

          // Hiện thông báo màu xanh
          toast({
            title:
              data.status === "Đi trễ"
                ? "⚠️ Đã điểm danh (Đi trễ)"
                : "✅ Điểm danh thành công",
            description: `Xin chào ${data.employee}. Thời gian: ${data.time}`,
            variant: data.status === "Đi trễ" ? "destructive" : "default", // Đỏ nếu trễ, Xanh nếu đúng
          });

          // Phát âm thanh bip (nếu muốn)
          // const audio = new Audio('/success-beep.mp3'); audio.play();
        } else {
          // --- KỊCH BẢN LỖI (Đã điểm danh rồi hoặc mã sai) ---
          setLastResult({ type: "error", msg: data.msg });
          toast({
            title: "Lỗi điểm danh",
            description: data.msg,
            variant: "destructive",
          });
        }
      } catch (error) {
        setLastResult({ type: "error", msg: "Không thể kết nối đến máy chủ" });
      }

      // Sau 3 giây cho phép quét tiếp
      setTimeout(() => {
        setIsScanning(true);
        setLastResult(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      {/* Nút quay lại */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-white hover:bg-white/20"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-6 w-6" /> Quay lại
      </Button>

      <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">Máy Chấm Công</CardTitle>
          <CardDescription>
            Vui lòng đưa mã QR nhân viên vào khung hình
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative w-full aspect-square overflow-hidden rounded-xl border-4 border-blue-500 shadow-inner bg-gray-100">
            {/* COMPONENT QUÉT MÃ QR */}
            <Scanner
              onScan={handleScan}
              allowMultiple={true}
              scanDelay={2000} // Đợi 2s giữa các lần quét
            />

            {/* Hiệu ứng khung ngắm */}
            <div className="absolute inset-0 border-2 border-white/30 rounded-xl pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-400 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* KHU VỰC HIỂN THỊ KẾT QUẢ SAU KHI QUÉT */}
          <div className="h-24 w-full flex items-center justify-center">
            {lastResult ? (
              <div
                className={`text-center p-4 rounded-lg w-full ${
                  lastResult.type === "success"
                    ? lastResult.status === "Đi trễ"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-bold text-lg mb-1">
                  {lastResult.type === "success" ? (
                    <CheckCircle />
                  ) : (
                    <XCircle />
                  )}
                  {lastResult.type === "success"
                    ? lastResult.employee
                    : "Thất bại"}
                </div>
                <div className="text-sm flex items-center justify-center gap-1">
                  {lastResult.type === "success" && (
                    <>
                      <Clock className="w-4 h-4" /> {lastResult.time} -{" "}
                      {lastResult.status}
                    </>
                  )}
                  {lastResult.type === "error" && lastResult.msg}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 animate-pulse text-sm">
                Đang chờ quét...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
