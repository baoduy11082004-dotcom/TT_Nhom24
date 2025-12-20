"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Clock, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tách Component content để dùng Suspense (Tránh lỗi build Next.js)
function ScannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Kiểm tra URL xem đang ở chế độ nào
  const isCheckoutMode = searchParams.get("mode") === "checkout";

  const [isScanning, setIsScanning] = useState(true);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleScan = async (detectedCodes: any) => {
    const rawValue = detectedCodes[0]?.rawValue;

    if (rawValue && isScanning) {
      setIsScanning(false);
      
      // Chọn API dựa trên chế độ
      const apiEndpoint = isCheckoutMode 
        ? "http://localhost:5000/api/attendance/checkout"
        : "http://localhost:5000/api/attendance/scan";

      try {
        const res = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: rawValue }), 
        });

        const data = await res.json();

        if (res.ok) {
          setLastResult({ type: "success", ...data });
          
          toast({
            title: isCheckoutMode ? "✅ Đã Check-out!" : (data.status === "Đi trễ" ? "⚠️ Check-in (Trễ)" : "✅ Check-in Thành công"),
            description: isCheckoutMode 
                ? `Hẹn gặp lại ${data.employee || 'bạn'}! Giờ về: ${data.checkOutTime}`
                : `Xin chào ${data.employee}. Giờ vào: ${data.time}`,
            className: isCheckoutMode ? "bg-orange-100 border-orange-500 text-orange-900" : "bg-green-100 border-green-500 text-green-900",
            duration: 3000,
          });
        } else {
          setLastResult({ type: "error", msg: data.msg });
          toast({
             title: "Lỗi",
             description: data.msg,
             variant: "destructive",
          });
        }
      } catch (error) {
        setLastResult({ type: "error", msg: "Lỗi kết nối máy chủ" });
      }

      // Quét tiếp sau 3 giây
      setTimeout(() => {
        setIsScanning(true);
        setLastResult(null);
      }, 3000);
    }
  };

  // Cấu hình giao diện (Màu Xanh cho Check-in, Cam cho Check-out)
  const themeColor = isCheckoutMode ? "text-orange-600" : "text-blue-600";
  const borderColor = isCheckoutMode ? "border-orange-500" : "border-blue-500";
  const titleText = isCheckoutMode ? "MÁY CHECK-OUT (RA VỀ)" : "MÁY CHẤM CÔNG (VÀO CA)";

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-white hover:bg-white/20 z-10"
        onClick={() => router.back()} // Quay lại Dashboard
      >
        <ArrowLeft className="mr-2 h-6 w-6" /> Quay lại
      </Button>

      <Card className="w-full max-w-md bg-white shadow-2xl border-0">
        <CardHeader className={`text-center pb-4 ${isCheckoutMode ? 'bg-orange-50' : 'bg-blue-50'} rounded-t-xl`}>
          <CardTitle className={`text-2xl font-black uppercase ${themeColor}`}>
            {titleText}
          </CardTitle>
          <CardDescription>Đưa mã QR nhân viên vào khung</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center p-0">
          <div className="relative w-full aspect-square bg-black">
            <Scanner onScan={handleScan} allowMultiple={true} scanDelay={2000} />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
               <div className={`w-64 h-64 border-4 rounded-3xl animate-pulse ${borderColor} opacity-80`}></div>
            </div>
          </div>

          <div className="w-full p-6 min-h-[120px] flex items-center justify-center bg-white rounded-b-xl">
            {lastResult ? (
              <div className={`flex flex-col items-center animate-in zoom-in ${lastResult.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                 {lastResult.type === 'success' ? <CheckCircle className="w-12 h-12 mb-2" /> : <XCircle className="w-12 h-12 mb-2" />}
                 <p className="font-bold text-xl text-center">{lastResult.msg || (isCheckoutMode ? "Đã ra về" : "Đã vào ca")}</p>
                 {lastResult.type === 'success' && (
                    <p className="text-gray-600 font-medium mt-1">{lastResult.employee} - {lastResult.time || lastResult.checkOutTime}</p>
                 )}
              </div>
            ) : (
              <div className={`flex flex-col items-center ${isCheckoutMode ? 'text-orange-400' : 'text-blue-400'} animate-pulse`}>
                 {isCheckoutMode ? <LogOut className="w-10 h-10 mb-2 opacity-50" /> : <LogIn className="w-10 h-10 mb-2 opacity-50" />}
                 <p className="font-semibold">Đang chờ quét...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-20">Đang khởi động Camera...</div>}>
      <ScannerContent />
    </Suspense>
  );
}