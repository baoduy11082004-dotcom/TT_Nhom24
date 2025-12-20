"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isWeekend,
  isAfter,
  startOfToday,
  getDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Định nghĩa kiểu dữ liệu
interface AttendanceRecord {
  id: number;
  date: string; // YYYY-MM-DD
  check_in_time: string;
  status: string;
}

interface AttendanceCalendarProps {
  data: AttendanceRecord[];
  isEditable?: boolean; // HR = true, Employee = false
  onDataChange?: () => void; // Hàm gọi lại khi dữ liệu thay đổi
}

export function AttendanceCalendar({
  data,
  isEditable = false,
  onDataChange,
}: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();

  // State quản lý Dialog sửa giờ
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [newTime, setNewTime] = useState("");

  // 1. Lấy danh sách các ngày trong tháng hiện tại
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  // 2. Tính toán ô trống đầu tháng để lịch hiển thị đúng thứ (CN đầu tuần)
  const startDay = getDay(startOfMonth(currentMonth));
  const emptyDays = Array(startDay).fill(null);

  // 3. Logic xác định trạng thái của 1 ngày
  const getDayStatus = (day: Date) => {
    // Tìm xem ngày này có dữ liệu chấm công không
    // Lưu ý: data.date từ API trả về có thể là chuỗi ISO, cần parse hoặc so sánh chuỗi
    const record = data.find((r) => {
      const recordDate =
        typeof r.date === "string" ? parseISO(r.date) : new Date(r.date);
      return isSameDay(recordDate, day);
    });

    const isPast = isAfter(startOfToday(), day); // Ngày đã qua
    const isWknd = isWeekend(day); // Cuối tuần

    // ƯU TIÊN 1: Có dữ liệu chấm công
    if (record) {
      if (record.status === "Đi trễ") {
        return {
          type: "late",
          record,
          color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
          textColor: "text-yellow-700",
        };
      }
      return {
        type: "present",
        record,
        color: "bg-green-50 border-green-200 hover:bg-green-100",
        textColor: "text-green-700",
      };
    }

    // ƯU TIÊN 2: Không có dữ liệu nhưng là ngày trong quá khứ và không phải cuối tuần -> VẮNG
    if (isPast && !isWknd) {
      return {
        type: "absent",
        record: null,
        color: "bg-red-50 border-red-200 hover:bg-red-100",
        textColor: "text-red-700",
      };
    }

    // Mặc định: Ngày thường hoặc tương lai
    return {
      type: "none",
      record: null,
      color: "bg-white border-gray-100 text-gray-400",
      textColor: "text-gray-500",
    };
  };

  // 4. Xử lý khi click vào ô ngày
  const handleCellClick = (dayStatus: any, day: Date) => {
    if (!isEditable) return;

    if (dayStatus.record) {
      // Nếu đã có record -> Mở dialog sửa
      setSelectedRecord(dayStatus.record);
      setNewTime(dayStatus.record.check_in_time);
      setIsDialogOpen(true);
    } else if (dayStatus.type === "absent") {
      // Nếu vắng -> Có thể thông báo hoặc mở dialog tạo mới (tùy nhu cầu, ở đây ta thông báo)
      toast({
        title: "Thông tin",
        description: "Nhân viên vắng mặt ngày này. Chưa hỗ trợ tạo bù.",
      });
    }
  };

  // 5. Gọi API cập nhật giờ
  const handleSaveEdit = async () => {
    if (!selectedRecord) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/attendance/${selectedRecord.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newTime }),
        }
      );

      if (res.ok) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật giờ chấm công.",
        });
        setIsDialogOpen(false);
        if (onDataChange) onDataChange(); // Refresh lại dữ liệu trang cha
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi kết nối",
        description: "Không kết nối được server.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Lịch */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <h2 className="text-lg font-bold capitalize flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          {format(currentMonth, "MMMM yyyy", { locale: vi })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lưới Lịch */}
      <div className="grid grid-cols-7 gap-2">
        {/* Tiêu đề thứ */}
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
          <div
            key={d}
            className="text-center text-sm font-semibold text-gray-500 py-2"
          >
            {d}
          </div>
        ))}

        {/* Ô trống */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Các ngày */}
        {daysInMonth.map((day) => {
          const { type, record, color, textColor } = getDayStatus(day);
          return (
            <div
              key={day.toISOString()}
              onClick={() => handleCellClick({ type, record }, day)}
              className={cn(
                "aspect-square rounded-xl border p-2 flex flex-col justify-between transition-all relative group bg-white",
                color,
                isEditable && (type === "present" || type === "late")
                  ? "cursor-pointer ring-offset-2 hover:ring-2 ring-blue-400"
                  : ""
              )}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    "font-bold text-sm",
                    isSameDay(day, new Date())
                      ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                      : "text-gray-700"
                  )}
                >
                  {format(day, "d")}
                </span>
                {isEditable && (type === "present" || type === "late") && (
                  <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>

              <div className="text-xs font-medium mt-1">
                {(type === "present" || type === "late") && record && (
                  <div className={textColor}>
                    <div className="font-bold text-lg tracking-tighter">
                      {record.check_in_time.slice(0, 5)}
                    </div>
                    <div className="text-[10px] uppercase font-bold opacity-80 mt-1 flex items-center gap-1">
                      {type === "present" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {record.status}
                    </div>
                  </div>
                )}
                {type === "absent" && (
                  <div className="flex flex-col items-center justify-center h-full pb-4">
                    <XCircle className="h-6 w-6 text-red-300 mb-1" />
                    <span className="text-red-600 font-bold text-xs uppercase">
                      Vắng
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chú thích màu */}
      <div className="flex flex-wrap gap-4 text-sm mt-4 justify-center bg-gray-50 p-3 rounded-lg border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="font-medium text-gray-700">Đúng giờ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="font-medium text-gray-700">Đi trễ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="font-medium text-gray-700">Vắng mặt</span>
        </div>
      </div>

      {/* Dialog Sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sửa giờ chấm công</DialogTitle>
            <DialogDescription>
              Thay đổi giờ vào làm cho nhân viên. Trạng thái sẽ tự động cập
              nhật.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Ngày
              </Label>
              <Input
                id="date"
                value={
                  selectedRecord
                    ? format(parseISO(selectedRecord.date as any), "dd/MM/yyyy")
                    : ""
                }
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Giờ vào
              </Label>
              <Input
                id="time"
                type="time"
                step="1"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="col-span-3 font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
