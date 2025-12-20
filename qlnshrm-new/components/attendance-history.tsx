"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, CalendarCheck } from "lucide-react";

// Định nghĩa kiểu dữ liệu cho bản ghi chấm công
interface AttendanceRecord {
  id: number;
  date: string;
  check_in_time: string;
  status: string;
}

interface AttendanceHistoryProps {
  data: AttendanceRecord[]; // Nhận dữ liệu từ cha truyền vào
}

export function AttendanceHistory({ data }: AttendanceHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5" />
          Lịch sử chấm công
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Giờ vào</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-gray-500 py-6"
                >
                  Chưa có dữ liệu chấm công nào.
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {/* Format ngày tháng (YYYY-MM-DD -> DD/MM/YYYY) */}
                    {new Date(record.date).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {record.check_in_time}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.status === "Đi trễ" ? "destructive" : "secondary"
                      }
                      className={
                        record.status === "Đúng giờ"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : ""
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
