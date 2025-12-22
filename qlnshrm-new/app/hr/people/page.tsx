"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // 1. Import Router
import { MoreHorizontal, Search, Mail, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddEmployeeDialog } from "@/components/add-employee-dialog";
import { EditEmployeeDialog } from "@/components/edit-employee-dialog";
import { useToast } from "@/hooks/use-toast";

export default function HRPeoplePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // 2. Khai báo router
  const { toast } = useToast();

  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/user");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhân viên",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/user/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");

      toast({ title: "Đã xóa nhân viên" });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhân viên",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nhân sự</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách nhân viên và thông tin chi tiết.
          </p>
        </div>
        <AddEmployeeDialog onSuccess={fetchUsers} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách nhân viên</CardTitle>
              <CardDescription>
                Tổng số {users.length} nhân viên trong công ty.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm..." className="pl-8 w-[250px]" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    // 3. THÊM LẠI SỰ KIỆN CLICK VÀO DÒNG ĐỂ CHUYỂN TRANG
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => router.push(`/hr/people/${user.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.image_url} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {user.team_id === "dev"
                          ? "Phát triển"
                          : user.team_id === "design"
                          ? "Thiết kế"
                          : user.team_id === "hr"
                          ? "Nhân sự"
                          : user.team_id === "qa"
                          ? "Kiểm thử"
                          : user.team_id}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Đang làm việc
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          {/* 4. QUAN TRỌNG: stopPropagation để bấm vào menu không bị nhảy trang */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation(); // Chặn nhảy trang
                              navigator.clipboard.writeText(user.email);
                            }}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Copy Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation(); // Chặn nhảy trang
                              setEditingEmployee(user);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Sửa thông tin
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation(); // Chặn nhảy trang
                              handleDelete(user.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa nhân viên
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EditEmployeeDialog
        open={!!editingEmployee}
        onOpenChange={(open) => {
          if (!open) setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onSuccess={() => {
          fetchUsers();
        }}
      />
    </div>
  );
}
