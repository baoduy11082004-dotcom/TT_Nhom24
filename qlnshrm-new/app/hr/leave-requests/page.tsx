"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Eye, Calendar } from "lucide-react"

// Mock data type
interface LeaveRequest {
  id: string
  employeeName: string
  employeeId: string
  avatar: string
  department: string
  phone: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: "Pending" | "Approved" | "Rejected"
  requestDate: string
}

// Mock data
const initialRequests: LeaveRequest[] = [
  {
    id: "LR001",
    employeeName: "Nguyễn Văn A",
    employeeId: "NV001",
    avatar: "/placeholder.svg",
    department: "Engineering",
    phone: "0901234567",
    startDate: "25/11/2025",
    endDate: "26/11/2025",
    totalDays: 2,
    reason: "Giải quyết việc gia đình",
    status: "Pending",
    requestDate: "23/11/2025",
  },
  {
    id: "LR002",
    employeeName: "Trần Thị B",
    employeeId: "NV005",
    avatar: "/placeholder.svg",
    department: "Design",
    phone: "0909876543",
    startDate: "28/11/2025",
    endDate: "28/11/2025",
    totalDays: 1,
    reason: "Khám bệnh định kỳ",
    status: "Approved",
    requestDate: "22/11/2025",
  },
  {
    id: "LR003",
    employeeName: "Lê Văn C",
    employeeId: "NV008",
    avatar: "/placeholder.svg",
    department: "Marketing",
    phone: "0912345678",
    startDate: "01/12/2025",
    endDate: "03/12/2025",
    totalDays: 3,
    reason: "Đi du lịch",
    status: "Rejected",
    requestDate: "21/11/2025",
  },
]

export default function HRLeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleStatusUpdate = (id: string, newStatus: "Approved" | "Rejected") => {
    setRequests(requests.map((req) => (req.id === id ? { ...req, status: newStatus } : req)))
    setIsDetailsOpen(false)
  }

  const openDetails = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Đã duyệt</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Từ chối</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Chờ duyệt</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý nghỉ phép</h1>
          <p className="text-gray-600 dark:text-gray-400">Xem và duyệt các đơn xin nghỉ phép của nhân viên</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Thời gian nghỉ</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={request.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{request.employeeName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{request.employeeName}</div>
                        <div className="text-xs text-gray-500">{request.department}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>
                        {request.startDate} - {request.endDate}
                      </span>
                      <span className="text-xs text-gray-500">({request.totalDays} ngày)</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={request.reason}>
                    {request.reason}
                  </TableCell>
                  <TableCell>{request.requestDate}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openDetails(request)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn xin nghỉ phép</DialogTitle>
            <DialogDescription>Mã đơn: {selectedRequest?.id}</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedRequest.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{selectedRequest.employeeName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold">{selectedRequest.employeeName}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedRequest.employeeId} • {selectedRequest.department}
                  </p>
                  <p className="text-sm text-gray-500">{selectedRequest.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 uppercase font-bold">Từ ngày</span>
                  <div className="flex items-center font-medium">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    {selectedRequest.startDate}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 uppercase font-bold">Đến ngày</span>
                  <div className="flex items-center font-medium">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    {selectedRequest.endDate}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase font-bold">Lý do nghỉ phép</span>
                <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-100 dark:border-gray-700">
                  {selectedRequest.reason}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Đóng
            </Button>
            {selectedRequest?.status === "Pending" && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="destructive"
                  onClick={() => selectedRequest && handleStatusUpdate(selectedRequest.id, "Rejected")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => selectedRequest && handleStatusUpdate(selectedRequest.id, "Approved")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Chấp thuận
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
