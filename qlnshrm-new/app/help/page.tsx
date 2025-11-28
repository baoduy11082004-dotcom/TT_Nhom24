import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageCircle, Phone, Mail, FileText } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Help & Support</h1>
        <p className="text-gray-600 dark:text-gray-400">Find answers to common questions or contact support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-gray-500 mb-4">Chat with our support team in real-time.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-sm text-gray-500 mb-4">Call us at 1900-1234 for urgent issues.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-sm text-gray-500 mb-4">Send us an email at support@company.com</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Làm sao để xem bảng lương?</AccordionTrigger>
              <AccordionContent>
                Bạn có thể xem bảng lương chi tiết tại trang Dashboard cá nhân, mục "Phiếu lương". Bảng lương được cập
                nhật vào ngày 5 hàng tháng.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Quy trình xin nghỉ phép như thế nào?</AccordionTrigger>
              <AccordionContent>
                Vào mục "Xin nghỉ phép" trên thanh menu, điền đầy đủ thông tin và gửi. Quản lý trực tiếp và HR sẽ nhận
                được thông báo để duyệt đơn của bạn.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Làm sao để đổi mật khẩu?</AccordionTrigger>
              <AccordionContent>
                Truy cập vào Avatar (góc phải trên) &gt; Account Settings &gt; Change Password để thực hiện đổi mật khẩu
                mới.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Quên chấm công phải làm sao?</AccordionTrigger>
              <AccordionContent>
                Nếu quên chấm công, vui lòng liên hệ trực tiếp với bộ phận HR hoặc tạo yêu cầu "Giải trình chấm công"
                trong mục Xin nghỉ phép/Giải trình để được hỗ trợ cập nhật lại.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
