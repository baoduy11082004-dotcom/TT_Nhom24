"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Clock, Edit, Save, X } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from "date-fns"
import { vi } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

export type AttendanceStatus = "on-time" | "late" | "absent" | "weekend" | "holiday"

export interface AttendanceRecord {
  date: Date
  checkIn?: string
  checkOut?: string
  status: AttendanceStatus
}

interface AttendanceHistoryProps {
  records: AttendanceRecord[]
  userName?: string
  isEditMode?: boolean
  onEditModeChange?: (value: boolean) => void
  allowEdit?: boolean
}

export function AttendanceHistory({
  records,
  userName,
  isEditMode = false,
  onEditModeChange,
  allowEdit = false,
}: AttendanceHistoryProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [editingDate, setEditingDate] = useState<Date | null>(null)
  const [editStatus, setEditStatus] = useState<AttendanceStatus>("on-time")
  const [editCheckIn, setEditCheckIn] = useState("")
  const [editCheckOut, setEditCheckOut] = useState("")
  const [localRecords, setLocalRecords] = useState(records)
  const { toast } = useToast()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleEditClick = (day: Date, record?: AttendanceRecord) => {
    setEditingDate(day)
    if (record) {
      setEditStatus(record.status)
      setEditCheckIn(record.checkIn || "")
      setEditCheckOut(record.checkOut || "")
    } else {
      setEditStatus("on-time")
      setEditCheckIn("08:00")
      setEditCheckOut("17:30")
    }
  }

  const handleSaveEdit = () => {
    if (!editingDate) return

    const updatedRecords = localRecords.filter((r) => !isSameDay(r.date, editingDate))

    if (editStatus !== "weekend") {
      updatedRecords.push({
        date: editingDate,
        status: editStatus,
        checkIn: editStatus === "absent" ? undefined : editCheckIn,
        checkOut: editStatus === "absent" ? undefined : editCheckOut,
      })
    }

    setLocalRecords(updatedRecords)
    setEditingDate(null)

    toast({
      title: "Cập nhật thành công",
      description: `Đã cập nhật chấm công cho ngày ${format(editingDate, "dd/MM/yyyy")}`,
    })
  }

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "on-time":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
      case "late":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
      case "absent":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      case "weekend":
        return "text-gray-400 bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case "on-time":
        return "Đúng giờ"
      case "late":
        return "Đi trễ"
      case "absent":
        return "Vắng mặt"
      case "weekend":
        return "Cuối tuần"
      default:
        return "N/A"
    }
  }

  const getDayRecord = (day: Date) => {
    const record = localRecords.find((r) => isSameDay(r.date, day))
    const dayOfWeek = getDay(day)

    // Auto-detect weekend if no record exists
    if (!record && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return { date: day, status: "weekend" as AttendanceStatus }
    }

    return record
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">Lịch sử chấm công {userName ? `- ${userName}` : ""}</CardTitle>
          <div className="flex items-center space-x-2">
            {allowEdit && (
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => onEditModeChange?.(!isEditMode)}
                className="mr-2"
              >
                {isEditMode ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Hoàn tất
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Cập nhật chấm công
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="font-medium min-w-[120px] text-center">
              {format(currentDate, "MMMM yyyy", { locale: vi })}
            </div>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <div key={day} className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            {Array.from({ length: getDay(monthStart) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white dark:bg-gray-900 p-4 min-h-[100px]" />
            ))}
            {daysInMonth.map((day) => {
              const record = getDayRecord(day)
              const isWeekend = record?.status === "weekend"

              return (
                <div
                  key={day.toISOString()}
                  className={`bg-white dark:bg-gray-900 p-2 min-h-[100px] border-t border-gray-100 dark:border-gray-800 relative group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    isToday(day) ? "ring-2 ring-inset ring-blue-500" : ""
                  } ${isEditMode && !isWeekend ? "cursor-pointer" : ""}`}
                  onClick={() => {
                    if (isEditMode && !isWeekend) {
                      handleEditClick(day, record)
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday(day) ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {isEditMode && !isWeekend && (
                      <Edit className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {record && (
                    <div className="space-y-1">
                      <Badge
                        variant="outline"
                        className={`w-full justify-center text-[10px] px-1 py-0.5 border ${getStatusColor(record.status)}`}
                      >
                        {getStatusText(record.status)}
                      </Badge>
                      {record.checkIn && (
                        <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {record.checkIn}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Đúng giờ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Đi trễ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Vắng mặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span>Cuối tuần</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingDate} onOpenChange={(open) => !open && setEditingDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật chấm công</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin chấm công cho ngày {editingDate && format(editingDate, "dd/MM/yyyy", { locale: vi })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={editStatus} onValueChange={(value) => setEditStatus(value as AttendanceStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="on-time">Đúng giờ</SelectItem>
                  <SelectItem value="late">Đi trễ</SelectItem>
                  <SelectItem value="absent">Vắng mặt</SelectItem>
                  <SelectItem value="weekend">Cuối tuần / Nghỉ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editStatus !== "absent" && editStatus !== "weekend" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="check-in">Giờ vào</Label>
                  <Input
                    id="check-in"
                    type="time"
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check-out">Giờ ra</Label>
                  <Input
                    id="check-out"
                    type="time"
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
              <strong>Lưu ý:</strong> Chỉ chỉnh sửa khi có lý do chính đáng (lỗi hệ thống, giải trình từ nhân viên).
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDate(null)}>
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
