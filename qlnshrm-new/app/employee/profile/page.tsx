import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, MapPin, Phone, Mail, Briefcase, Calendar } from "lucide-react"

export default function EmployeeProfilePage() {
  const employee = {
    name: "Nguyễn Văn A",
    role: "Senior Developer",
    department: "Engineering",
    email: "nguyenvana@company.com",
    phone: "+84 901 234 567",
    location: "Hồ Chí Minh",
    joinDate: "15/03/2022",
    dob: "15/08/1995",
    avatar: "/placeholder.svg",
    id: "EMP001",
    bio: "Đam mê công nghệ và phát triển phần mềm. Luôn tìm kiếm cơ hội học hỏi và đóng góp cho sự phát triển của công ty.",
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Thông tin cá nhân</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-center">Ảnh đại diện</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="w-40 h-40 mb-4 border-4 border-white shadow-lg">
              <AvatarImage src={employee.avatar || "/placeholder.svg"} />
              <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mt-2">{employee.name}</h2>
            <Badge variant="secondary" className="mt-2">
              {employee.role}
            </Badge>
            <div className="mt-6 p-4 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center w-full">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${employee.id}`}
                alt="Employee QR Code"
                className="w-32 h-32 mb-2"
              />
              <p className="text-xs text-gray-500 font-mono">{employee.id}</p>
              <p className="text-xs text-blue-600 font-medium mt-1">Mã chấm công</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              Chi tiết hồ sơ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Giới thiệu</h3>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                {employee.bio}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-2" /> Email
                </div>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="w-4 h-4 mr-2" /> Điện thoại
                </div>
                <p className="font-medium">{employee.phone}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" /> Ngày sinh
                </div>
                <p className="font-medium">{employee.dob}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Briefcase className="w-4 h-4 mr-2" /> Phòng ban
                </div>
                <p className="font-medium">{employee.department}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" /> Ngày vào làm
                </div>
                <p className="font-medium">{employee.joinDate}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-2" /> Văn phòng
                </div>
                <p className="font-medium">{employee.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
