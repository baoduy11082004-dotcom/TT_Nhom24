import { Clock, Calendar, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TimekeepingPage() {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chấm công</h1>
            <p className="text-gray-600 dark:text-gray-400">Quản lý thời gian làm việc và điểm danh</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Clock className="w-4 h-4 mr-2" />
              Check In
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Lịch sử
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giờ làm việc hôm nay</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">08:00 - 17:30</div>
              <p className="text-xs text-muted-foreground mt-1">Ca hành chính</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Đúng giờ</div>
              <p className="text-xs text-muted-foreground mt-1">Check-in lúc 07:55</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ngày công tháng này</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">22 / 24</div>
              <p className="text-xs text-muted-foreground mt-1">Còn 2 ngày làm việc</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử chấm công gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "Hôm nay", in: "07:55", out: "--:--", status: "working", type: "Hành chính" },
                { date: "Hôm qua", in: "07:58", out: "17:35", status: "present", type: "Hành chính" },
                { date: "20/11/2025", in: "08:05", out: "17:30", status: "late", type: "Hành chính" },
                { date: "19/11/2025", in: "07:50", out: "17:40", status: "present", type: "Hành chính" },
                { date: "18/11/2025", in: "07:55", out: "17:32", status: "present", type: "Hành chính" },
              ].map((record, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{record.date}</p>
                      <p className="text-sm text-gray-500">{record.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Check In</p>
                      <p className="font-medium">{record.in}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Check Out</p>
                      <p className="font-medium">{record.out}</p>
                    </div>
                    <div className="w-24 text-right">
                      {record.status === "working" && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Đang làm
                        </Badge>
                      )}
                      {record.status === "present" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Đúng giờ
                        </Badge>
                      )}
                      {record.status === "late" && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Đi muộn
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
