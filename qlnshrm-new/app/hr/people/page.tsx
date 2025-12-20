"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Filter, FileDown } from "lucide-react";
// Đảm bảo bạn đã có component này, nếu chưa thì báo mình nhé
import { AddEmployeeDialog } from "@/components/add-employee-dialog";

export default function PeoplePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm gọi API lấy danh sách
  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      // --- SỬA LỖI TẠI ĐÂY ---
      // Dùng "/api/user" thay vì "/api/user/users"
      const res = await fetch(
        `http://localhost:5000/api/user?_t=${new Date().getTime()}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        // Nếu lỗi, thử đọc nội dung lỗi từ server
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.msg || `Lỗi ${res.status}: Không thể tải dữ liệu`
        );
      }

      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Lỗi tải danh sách nhân viên:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi trang vừa load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Logic lọc nhân viên theo ô tìm kiếm
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nhân sự</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách nhân viên và thông tin chi tiết.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
          {/* Nút thêm nhân viên - Truyền hàm fetchUsers để reload sau khi thêm xong */}
          <AddEmployeeDialog onSuccess={fetchUsers} />
        </div>
      </div>

      {/* Thanh tìm kiếm và bộ lọc */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm theo tên, email, chức vụ..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Bảng danh sách nhân viên */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
          <CardDescription>
            Hiện có {filteredEmployees.length} nhân viên trong hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Họ và Tên</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Chức vụ</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Phòng ban
                </TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                      Đang tải dữ liệu...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không tìm thấy nhân viên nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/hr/people/${employee.id}`)}
                  >
                    <TableCell>
                      <Avatar>
                        <AvatarImage
                          src={employee.image_url}
                          alt={employee.name}
                        />
                        <AvatarFallback className="uppercase">
                          {employee.name ? employee.name.charAt(0) : "NV"}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {employee.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {employee.email}
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell className="hidden sm:table-cell uppercase text-xs font-bold text-muted-foreground">
                      {employee.team_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.is_hr ? "default" : "secondary"}>
                        {employee.is_hr ? "Admin" : "Nhân viên"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
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
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/hr/people/${employee.id}`)
                            }
                          >
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              // Thêm logic sửa ở đây sau này
                              alert("Tính năng sửa đang cập nhật");
                            }}
                          >
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (
                                confirm("Bạn có chắc muốn xóa nhân viên này?")
                              ) {
                                await fetch(
                                  `http://localhost:5000/api/user/${employee.id}`,
                                  { method: "DELETE" }
                                );
                                fetchUsers();
                              }
                            }}
                          >
                            Xóa nhân viên
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
