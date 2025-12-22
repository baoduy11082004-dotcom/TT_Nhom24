"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TimekeepingPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // State cho chức năng Edit
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [newTime, setNewTime] = useState("");

  // 1. Hàm load dữ liệu
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/attendance/all");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Lỗi:", error);
      toast({
        title: "Lỗi tải dữ liệu",
        description: "Không thể kết nối đến server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // 2. Mở dialog sửa
  const handleEditClick = (record: any) => {
    setSelectedRecord(record);
    setNewTime(record.check_in_time); // Điền sẵn giờ cũ
    setIsEditOpen(true);
  };

  // 3. Lưu thay đổi
  const handleSaveEdit = async () => {
    if (!selectedRecord) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/attendance/${selectedRecord.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newTime: newTime }),
        }
      );

      if (res.ok) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật giờ chấm công.",
        });
        setIsEditOpen(false);
        fetchAttendance(); // Load lại bảng để thấy thay đổi
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Chấm công</h1>
        <Button onClick={fetchAttendance} variant="outline">
          <ArrowUpDown className="w-4 h-4 mr-2" /> Làm mới dữ liệu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nhật ký chấm công toàn công ty</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Giờ vào</TableHead>
                <TableHead>Giờ ra</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Chưa có dữ liệu chấm công.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {/* Nếu có avatar thì hiển thị, không thì dùng placeholder */}
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {record.image_url ? (
                            <img
                              src={record.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-gray-500">
                              {record.employee_name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div>{record.employee_name}</div>
                          <div className="text-xs text-gray-500">
                            {record.user_id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString("vi-VN")}
                    </TableCell>

                    {/* --- CỘT GIỜ VÀO --- */}
                    <TableCell className="font-bold text-blue-600">
                      {record.check_in_time}
                    </TableCell>

                    {/* --- CỘT GIỜ RA (MỚI) --- */}
                    <TableCell className="font-bold text-orange-600">
                      {record.check_out_time ? (
                        record.check_out_time
                      ) : (
                        <span className="text-gray-300 font-normal italic">
                          --:--
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          record.status === "Đi trễ"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(record)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Sửa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIALOG CHỈNH SỬA */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa giờ vào làm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Nhân viên:{" "}
                <span className="font-bold">
                  {selectedRecord?.employee_name}
                </span>
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Thời gian Check-in mới</Label>
              <Input
                id="time"
                type="time" // Input chọn giờ
                step="1" // Cho phép nhập giây
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Lưu ý: Hệ thống sẽ tự động tính lại trạng thái (Đúng giờ/Trễ)
                dựa trên giờ mới.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
