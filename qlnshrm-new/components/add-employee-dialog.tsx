"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, AlertCircle, Loader2 } from "lucide-react"; // Nhớ import Loader2

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// 1. Schema Validate
const formSchema = z.object({
  id: z.string().min(3, "ID phải có ít nhất 3 ký tự"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.string().min(1, "Vui lòng chọn chức vụ"),
  team: z.string().min(1, "Vui lòng chọn phòng ban"),
});

// 2. Props
interface AddEmployeeDialogProps {
  onSuccess?: () => void;
}

export function AddEmployeeDialog({ onSuccess }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState(""); // Biến lưu lỗi từ Server
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      name: "",
      email: "",
      password: "123",
      role: "",
      team: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setServerError(""); // Xóa lỗi cũ

    try {
      const res = await fetch("http://localhost:5000/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        // CẬP NHẬT BIẾN LỖI ĐỂ HIỆN THÔNG BÁO ĐỎ
        setServerError(data.msg || "Có lỗi xảy ra");
        
        // Hiện thêm toast báo lỗi cho chắc
        toast({
            variant: "destructive",
            title: "Lỗi",
            description: data.msg,
        });
        return;
      }

      // THÀNH CÔNG:
      toast({
        title: "Thêm nhân viên thành công",
        description: `${values.name} đã được thêm vào hệ thống.`,
        className: "bg-green-50 border-green-200 text-green-800",
      });

      setOpen(false);
      form.reset();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setServerError("Không thể kết nối đến Server");
      toast({
        title: "Lỗi mạng",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(val) => {
        setOpen(val);
        if(!val) setServerError(""); // Đóng form thì reset lỗi
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
          <DialogDescription>
            Tạo tài khoản mới cho nhân viên. Nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* === KHU VỰC HIỂN THỊ LỖI MÀU ĐỎ === */}
            {serverError && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-semibold">{serverError}</span>
              </div>
            )}

            {/* ID */}
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Nhân viên (ID)</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: dev_005" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tên */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và Tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên nhân viên" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="examplen@mailinator.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chức vụ</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chức vụ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Frontend Developer">
                        Frontend Developer
                      </SelectItem>
                      <SelectItem value="Backend Developer">
                        Backend Developer
                      </SelectItem>
                      <SelectItem value="UI/UX Designer">
                        UI/UX Designer
                      </SelectItem>
                      <SelectItem value="Tester">Tester</SelectItem>
                      <SelectItem value="HR Staff">HR Staff</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team */}
            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dev">Phát triển (Dev)</SelectItem>
                      <SelectItem value="design">Thiết kế (Design)</SelectItem>
                      <SelectItem value="qa">Kiểm thử (QA)</SelectItem>
                      <SelectItem value="hr">Nhân sự (HR)</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                    </>
                ) : "Lưu nhân viên"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}