import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// 1. Thêm trạng thái 'leave' vào định nghĩa kiểu dữ liệu
export type AttendanceStatus = "on-time" | "late" | "absent" | "leave"

export interface AttendanceRecord {
  date: Date
  status: AttendanceStatus
  checkIn?: string
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[]
}

export function AttendanceHistory({ records }: AttendanceHistoryProps) {
  // Hàm lấy màu sắc và nhãn dựa trên trạng thái
  const getStatusConfig = (status: AttendanceStatus) => {
    switch (status) {
      case "on-time":
        return { color: "bg-green-500", label: "Đúng giờ", text: "text-green-700 bg-green-50" }
      case "late":
        return { color: "bg-yellow-500", label: "Đi trễ", text: "text-yellow-700 bg-yellow-50" }
      case "absent":
        return { color: "bg-red-500", label: "Vắng mặt", text: "text-red-700 bg-red-50" }
      case "leave":
        // Màu tím cho ngày nghỉ phép
        return { color: "bg-purple-500", label: "Nghỉ phép", text: "text-purple-700 bg-purple-50" }
      default:
        return { color: "bg-gray-500", label: "N/A", text: "text-gray-700 bg-gray-50" }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Lịch sử chấm công</h3>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Đúng giờ</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Trễ</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Vắng</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Nghỉ</div>
        </div>
      </div>
      
      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 font-medium text-gray-500">
           <div>CN</div><div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div>
        </div>
        
        {/* Render dạng lịch đơn giản (Giả lập Grid cho demo) */}
        <div className="grid grid-cols-7 gap-2">
          {/* Padding cho ngày đầu tháng (Ví dụ tháng bắt đầu từ T2) */}
          <div className="invisible"></div> 

          {records.map((record, index) => {
            const config = getStatusConfig(record.status)
            return (
              <div 
                key={index} 
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg border text-xs min-h-[60px] transition-colors hover:opacity-80",
                  config.text
                )}
              >
                <span className="font-bold text-sm">{record.date.getDate()}</span>
                <span className="mt-1 font-medium">{record.checkIn || config.label}</span>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}