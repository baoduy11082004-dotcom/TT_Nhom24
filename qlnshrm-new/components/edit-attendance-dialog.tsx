"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Clock, LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";

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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  check_in: z.string().min(1, "Giờ vào không được để trống"),
  check_out: z.string().optional(),
});

interface EditAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: any;
  onSuccess: () => void;
}

export function EditAttendanceDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: EditAttendanceDialogProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      check_in: "",
      check_out: "",
    },
  });

  // Helper: Format dữ liệu để hiển thị lên ô input (datetime-local)
  const formatForInput = (isoString: string | null) => {
    if (!isoString) return "";
    try {
      return format(new Date(isoString), "yyyy-MM-dd'T'HH:mm");
    } catch (e) {
      return "";
    }
  };

  useEffect(() => {
    if (record) {
      form.reset({
        check_in: formatForInput(record.check_in),
        check_out: formatForInput(record.check_out),
      });
    }
  }, [record, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!record?.id) return;

    try {
      // Chuẩn bị dữ liệu gửi đi (Convert lại sang ISO String chuẩn quốc tế)
      const payload = {
        check_in: new Date(values.check_in).toISOString(),
        check_out: values.check_out ? new Date(values.check_out).toISOString() : null,
      };

      const res = await fetch(`http://localhost:5000/api/attendance/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Lỗi khi cập nhật");

      toast({
        title: "Thành công",
        description: `Đã cập nhật giờ công cho nhân viên ${record.name}`,
      });

      onSuccess(); // Load lại bảng danh sách bên ngoài
      onOpenChange(false); // Tắt form
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sửa dữ liệu chấm công</DialogTitle>
          <DialogDescription>
            Điều chỉnh giờ cho nhân viên: <b>{record?.name}</b>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            
            {/* === PHẦN TABS CHUYỂN ĐỔI (SWITCHER) === */}
            <Tabs defaultValue="check_in" className="w-full mt-4">
              
              {/* Thanh điều hướng 2 nút to */}
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="check_in" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  <LogIn className="w-4 h-4 mr-2" /> Sửa Giờ Vào
                </TabsTrigger>
                <TabsTrigger value="check_out" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                  <LogOut className="w-4 h-4 mr-2" /> Sửa Giờ Ra
                </TabsTrigger>
              </TabsList>

              {/* Màn hình 1: CHECK IN */}
              <TabsContent value="check_in" className="mt-4 p-4 border rounded-lg bg-blue-50/30">
                <FormField
                  control={form.control}
                  name="check_in"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-700 font-semibold">Thời gian Bắt đầu (Check-in)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} className="bg-white" />
                      </FormControl>
                      <FormDescription>
                        Chỉnh sửa nếu nhân viên quên quét mã lúc đến.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              {/* Màn hình 2: CHECK OUT */}
              <TabsContent value="check_out" className="mt-4 p-4 border rounded-lg bg-orange-50/30">
                <FormField
                  control={form.control}
                  name="check_out"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-700 font-semibold">Thời gian Kết thúc (Check-out)</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} className="bg-white" />
                      </FormControl>
                      <FormDescription>
                        Chỉnh sửa nếu máy quét lỗi hoặc nhân viên quên Check-out.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}