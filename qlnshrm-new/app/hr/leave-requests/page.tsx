"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock } from "lucide-react"

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])

  // 1. Lấy danh sách đơn từ Database
  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/leave/all')
      const data = await res.json()
      setRequests(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // 2. Hàm xử lý Duyệt / Từ chối
  const handleUpdateStatus = async (id: number, status: string, name: string) => {
    if(!confirm(`Bạn chắc chắn muốn ${status === 'Approved' ? 'DUYỆT' : 'TỪ CHỐI'} đơn này?`)) return;

    try {
      await fetch(`http://localhost:5000/api/leave/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, employeeName: name })
      })
      
      // Load lại danh sách sau khi bấm
      fetchRequests() 
      alert("Đã cập nhật thành công!")
    } catch (err) {
      alert("Lỗi cập nhật")
    }
  }

  // Helper format ngày
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý nghỉ phép</h1>
        <p className="text-gray-500">Xem và duyệt các đơn xin nghỉ phép của nhân viên</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 pl-2">Nhân viên</th>
                  <th className="pb-3">Phòng ban</th>
                  <th className="pb-3">Thời gian</th>
                  <th className="pb-3">Lý do</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3 text-right pr-2">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {requests.length === 0 ? (
                  <tr><td colSpan={6} className="pt-4 text-center text-gray-500">Chưa có đơn nào.</td></tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 pl-2 font-medium">{req.full_name}</td>
                      <td className="py-4 text-gray-600">{req.team}</td>
                      <td className="py-4">
                        {formatDate(req.start_date)} - {formatDate(req.end_date)}
                      </td>
                      <td className="py-4 text-gray-600 max-w-[200px] truncate">{req.reason}</td>
                      <td className="py-4">
                        <Badge className={
                          req.status === 'Approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                          'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                        }>
                          {req.status === 'Approved' ? 'Đã duyệt' : 
                           req.status === 'Rejected' ? 'Từ chối' : 'Chờ duyệt'}
                        </Badge>
                      </td>
                      <td className="py-4 text-right pr-2">
                        {req.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 h-8"
                              onClick={() => handleUpdateStatus(req.id, 'Approved', req.full_name)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" /> Duyệt
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8"
                              onClick={() => handleUpdateStatus(req.id, 'Rejected', req.full_name)}
                            >
                              <XCircle className="w-4 h-4 mr-1" /> Từ chối
                            </Button>
                          </div>
                        )}
                        {req.status !== 'Pending' && <span className="text-gray-400 text-xs">Đã xử lý</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}