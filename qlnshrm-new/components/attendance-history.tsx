import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export type AttendanceStatus = "on-time" | "late" | "absent" | "leave" | "weekend"

export interface AttendanceRecord {
  date: Date | string // Hỗ trợ cả chuỗi (từ API) và Date object
  status: AttendanceStatus
  checkIn?: string
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[]
  userName?: string
  isEditMode?: boolean
  onEditModeChange?: (val: boolean) => void
  allowEdit?: boolean
  displayMonth?: string 
}

export function AttendanceHistory({ records, displayMonth }: AttendanceHistoryProps) {
  
  // 1. Xử lý an toàn: Đảm bảo lấy được ngày đầu tiên dù là chuỗi hay Date
  const getFirstDay = () => {
    if (!records || records.length === 0) return 0;
    const firstDate = new Date(records[0].date); // Chuyển đổi an toàn
    return firstDate.getDay();
  };

  const firstDayOfMonth = getFirstDay();
  // Tạo mảng ô trống đầu tháng để lịch hiển thị đúng thứ
  const paddingDays = Array.from({ length: firstDayOfMonth });

  const getStatusConfig = (status: AttendanceStatus) => {
    switch (status) {
      case "on-time":
        return { color: "bg-green-500", label: "Đúng giờ", text: "text-green-700 bg-green-50 border-green-200" }
      case "late":
        return { color: "bg-yellow-500", label: "Đi trễ", text: "text-yellow-700 bg-yellow-50 border-yellow-200" }
      case "absent":
        return { color: "bg-red-500", label: "Vắng mặt", text: "text-red-700 bg-red-50 border-red-200" }
      case "leave":
        return { color: "bg-purple-500", label: "Nghỉ phép", text: "text-purple-700 bg-purple-50 border-purple-200" }
      case "weekend":
        return { color: "bg-gray-300", label: "Cuối tuần", text: "text-gray-400 bg-gray-100 border-dashed" }
      default:
        return { color: "bg-gray-500", label: "N/A", text: "text-gray-700 bg-gray-50" }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg">Lịch sử chấm công</h3>
            {displayMonth && (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                    {displayMonth}
                </span>
            )}
        </div>
        
        <div className="flex gap-2 text-xs text-muted-foreground hidden sm:flex">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>Đúng</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Trễ</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Vắng</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300"></div>Nghỉ/Cuối tuần</div>
        </div>
      </div>
      
      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
        {/* Header Thứ */}
        <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 font-bold text-gray-500">
           <div className="text-red-500">CN</div>
           <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div>
           <div className="text-blue-500">T7</div>
        </div>
        
        {/* Grid Lịch */}
        <div className="grid grid-cols-7 gap-2">
          {/* Render các ô trống đầu tháng */}
          {paddingDays.map((_, index) => (
            <div key={`pad-${index}`} className="invisible min-h-[60px]"></div>
          ))}

          {/* Render dữ liệu ngày */}
          {records.map((record, index) => {
            const config = getStatusConfig(record.status)
            const isWeekend = record.status === 'weekend';
            // Đảm bảo date là đối tượng Date để gọi .getDate()
            const dateObj = new Date(record.date);
            
            return (
              <div 
                key={index} 
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg border text-xs min-h-[60px] transition-all hover:brightness-95",
                  config.text,
                  isWeekend && "opacity-60"
                )}
              >
                <span className={cn("font-bold text-sm", isWeekend ? "text-gray-500" : "")}>
                    {dateObj.getDate()}
                </span>
                <span className="mt-1 font-medium truncate w-full text-center">
                    {record.checkIn || (isWeekend ? "" : config.label)}
                </span>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}