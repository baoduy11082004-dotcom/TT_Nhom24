"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Camera } from "lucide-react"

export default function ScannerPage() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    // Initialize time on client side only
    setCurrentTime(new Date())

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Helper to format time safely
  const formatTime = (date: Date | null) => {
    if (!date) return "--:--:--"
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "..."
    return date.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-white hover:bg-white/20"
        onClick={() => router.push("/login")}
      >
        <ArrowLeft className="w-6 h-6 mr-2" />
        Quay lại
      </Button>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-white text-3xl font-bold">Máy Chấm Công</h1>
          <div className="flex flex-col items-center justify-center text-blue-400">
            <div className="text-6xl font-mono font-bold tracking-wider my-4">{formatTime(currentTime)}</div>
            <div className="text-xl text-gray-400">{formatDate(currentTime)}</div>
          </div>
        </div>

        <div className="relative aspect-square max-w-sm mx-auto bg-gray-900 rounded-3xl border-4 border-gray-800 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Simulation of a camera view */}
            <div className="text-gray-600 flex flex-col items-center">
              <Camera className="w-16 h-16 mb-4 opacity-50" />
              <p>Đang kích hoạt camera...</p>
            </div>
          </div>

          {/* Scanning Overlay */}
          <div className="absolute inset-0 border-[40px] border-black/50 z-10"></div>
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-64 h-64 border-2 border-blue-500 rounded-lg relative animate-pulse">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>

              {/* Scanning line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-[scan_2s_linear_infinite]"></div>
            </div>
          </div>
        </div>

        <Card className="bg-gray-900 border-gray-800 p-6 text-center">
          <p className="text-gray-300">Vui lòng đưa mã QR của bạn vào khung hình để thực hiện chấm công</p>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}
