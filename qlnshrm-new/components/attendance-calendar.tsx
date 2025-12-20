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
  PlusCircle
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

interface AttendanceRecord {
  id: number;
  date: string;
  check_in_time: string;
  status: string;
}

interface AttendanceCalendarProps {
  data: AttendanceRecord[];
  userId?: string;
  isEditable?: boolean;
  onDataChange?: () => void;
  // Thêm props để đồng bộ thời gian
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
}

export function AttendanceCalendar({
  data,
  userId,
  isEditable = false,
  onDataChange,
  currentDate = new Date(), // Mặc định là hôm nay nếu không truyền
  onDateChange,
}: AttendanceCalendarProps) {
  
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTime, setNewTime] = useState("");

  // Hàm chuyển tháng
  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    if (onDateChange) onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    if (onDateChange) onDateChange(newDate);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const startDay = getDay(startOfMonth(currentDate));
  const emptyDays = Array(startDay).fill(null);

  const getDayStatus = (day: Date) => {
    const record = data.find((r) => {
      const recordDate = typeof r.date === "string" ? parseISO(r.date) : new Date(r.date);
      return isSameDay(recordDate, day);
    });

    const isPast = isAfter(startOfToday(), day);
    const isWknd = isWeekend(day);

    if (record) {
      const isLate = record.status === "Đi trễ";
      return {
        type: isLate ? "late" : "present",
        record,
        color: isLate ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100" : "bg-green-50 border-green-200 hover:bg-green-100",
        textColor: isLate ? "text-yellow-700" : "text-green-700",
      };
    }

    if (isPast && !isWknd) {
      return {
        type: "absent",
        record: null,
        color: "bg-red-50 border-red-200 hover:bg-red-100 cursor-pointer",
        textColor: "text-red-700",
      };
    }

    return {
      type: "none",
      record: null,
      color: "bg-white border-gray-100 text-gray-400",
      textColor: "text-gray-500",
    };
  };

  const handleCellClick = (dayStatus: any, day: Date) => {
    if (!isEditable) return;

    if (dayStatus.record) {
      setSelectedRecord(dayStatus.record);
      setSelectedDate(null);
      setNewTime(dayStatus.record.check_in_time);
      setIsDialogOpen(true);
    } 
    else if (dayStatus.type === "absent" || (isAfter(startOfToday(), day) && !isWeekend(day))) {
      setSelectedRecord(null);
      setSelectedDate(day);
      setNewTime("08:00");
      setIsDialogOpen(true);
    }
  };

  const handleSave = async () => {
    try {
      let url = "";
      let method = "";
      let body = {};

      if (selectedRecord) {
        url = `http://localhost:5000/api/attendance/${selectedRecord.id}`;
        method = "PUT";
        body = { newTime };
      } else if (selectedDate && userId) {
        url = `http://localhost:5000/api/attendance/create`;
        method = "POST";
        body = { 
            userId: userId,
            date: format(selectedDate, "yyyy-MM-dd"),
            time: newTime 
        };
      } else {
        return;
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (res.ok) {
        toast({
          title: "Thành công",
          description: "Cập nhật dữ liệu thành công.",
          className: "bg-green-100 border-green-500 text-green-900"
        });
        setIsDialogOpen(false);
        if (onDataChange) onDataChange();
      } else {
        toast({
          title: "Lỗi",
          description: result.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Lỗi kết nối", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
        <h2 className="text-lg font-bold capitalize flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          {format(currentDate, "MMMM yyyy", { locale: vi })}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
          <div key={d} className="text-center text-sm font-semibold text-gray-500 py-2">
            {d}
          </div>
        ))}

        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {daysInMonth.map((day) => {
          const { type, record, color, textColor } = getDayStatus(day);
          return (
            <div
              key={day.toISOString()}
              onClick={() => handleCellClick({ type, record }, day)}
              className={cn(
                "aspect-square rounded-xl border p-2 flex flex-col justify-between transition-all relative group bg-white",
                color,
                isEditable && (type === "present" || type === "late" || type === "absent")
                  ? "cursor-pointer ring-offset-2 hover:ring-2 ring-blue-400 hover:shadow-md"
                  : ""
              )}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                    "font-bold text-sm",
                    isSameDay(day, new Date()) ? "bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : "text-gray-700"
                  )}>
                  {format(day, "d")}
                </span>
                
                {isEditable && (
                    <>
                        {(type === "present" || type === "late") && (
                            <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        {type === "absent" && (
                            <PlusCircle className="h-3 w-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </>
                )}
              </div>

              <div className="text-xs font-medium mt-1">
                {(type === "present" || type === "late") && record && (
                  <div className={textColor}>
                    <div className="font-bold text-lg tracking-tighter">
                      {record.check_in_time.slice(0, 5)}
                    </div>
                    <div className="text-[10px] uppercase font-bold opacity-80 mt-1 flex items-center gap-1">
                      {type === "present" ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {record.status}
                    </div>
                  </div>
                )}
                {type === "absent" && (
                  <div className="flex flex-col items-center justify-center h-full pb-4">
                    <XCircle className="h-6 w-6 text-red-300 mb-1" />
                    <span className="text-red-600 font-bold text-xs uppercase">Vắng</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedRecord ? "Sửa giờ chấm công" : "Bổ sung chấm công"}</DialogTitle>
            <DialogDescription>
                {selectedRecord ? "Cập nhật giờ vào làm." : "Tạo dữ liệu chấm công cho ngày vắng."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Ngày</Label>
              <Input
                value={selectedRecord 
                    ? format(parseISO(selectedRecord.date as any), "dd/MM/yyyy") 
                    : (selectedDate ? format(selectedDate, "dd/MM/yyyy") : "")}
                disabled
                className="col-span-3 font-bold"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">Giờ vào</Label>
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>{selectedRecord ? "Lưu thay đổi" : "Tạo mới"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}