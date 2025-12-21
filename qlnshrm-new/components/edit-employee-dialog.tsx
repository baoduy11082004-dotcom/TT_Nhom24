"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

// Schema validate dữ liệu (Đã xóa validate giờ làm/giờ về)
const formSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  role: z.string().min(1, "Vui lòng chọn chức vụ"),
  team: z.string().min(1, "Vui lòng chọn phòng ban"),
});

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any; // Dữ liệu nhân viên cần sửa
  onSuccess: () => void;
}

export function EditEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EditEmployeeDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      role: "",
      team: "",
    },
  });

  // Mỗi khi mở dialog hoặc đổi nhân viên, reset form về dữ liệu cũ
  useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name || "",
        role: employee.role || "",
        team: employee.team_id || "", 
        // Không cần load giờ làm/giờ về nữa
      });
    }
  }, [employee, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!employee?.id) return;

    try {
      // Gọi API PUT để cập nhật
      const res = await fetch(`http://localhost:5000/api/user/${employee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Có lỗi xảy ra khi cập nhật");
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin nhân viên.",
      });

      onSuccess(); // Load lại danh sách bên ngoài
      onOpenChange(false); // Đóng dialog
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Sửa thông tin nhân viên</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho nhân viên <b>{employee?.id}</b>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* ID & Email Read-Only */}
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Mã NV (Bị khóa)</FormLabel>
                <FormControl>
                  <Input value={employee?.id || ""} disabled className="bg-muted" />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Email (Bị khóa)</FormLabel>
                <FormControl>
                  <Input value={employee?.email || ""} disabled className="bg-muted" />
                </FormControl>
              </FormItem>
            </div>

            {/* Tên */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và Tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên nhân viên" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role - Combo Box */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chức vụ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chức vụ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                      <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                      <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                      <SelectItem value="Tester">Tester</SelectItem>
                      <SelectItem value="HR Staff">HR Staff</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team - Combo Box */}
            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
            
            {/* Đã xóa form nhập giờ làm/giờ về ở đây */}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}