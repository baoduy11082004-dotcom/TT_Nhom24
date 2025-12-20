"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface SalarySectionProps {
  attendanceData: any[];
  employee: any; 
  viewDate?: Date; // Nhận thêm prop ngày đang xem
}

export function SalarySection({ attendanceData, employee, viewDate = new Date() }: SalarySectionProps) {
  
  // 1. Cấu hình
  const STANDARD_WORK_DAYS = 26; 
  const DILIGENCE_BONUS = 500000; 
  const MIN_DAYS_FOR_BONUS = 22; 

  // 2. Lấy tháng/năm dựa trên LỊCH ĐANG XEM (viewDate)
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  // 3. Lọc dữ liệu theo tháng đó
  const thisMonthData = attendanceData.filter(item => {
    const d = new Date(item.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const workDays = thisMonthData.length; 
  const lateCount = thisMonthData.filter(item => item.status === "Đi trễ").length; 

  // 4. Logic tính lương
  // [UPDATED] Ưu tiên lấy base_salary, fallback về salary hoặc 0
  const baseSalary = employee?.base_salary || employee?.salary || 0;
  
  const salaryPerDay = baseSalary / STANDARD_WORK_DAYS;
  const actualSalary = Math.round(salaryPerDay * workDays);

  let bonus = 0;
  let isBonusQualified = false;
  let bonusReason = "";

  if (workDays >= MIN_DAYS_FOR_BONUS) {
      if (lateCount === 0) {
          bonus = DILIGENCE_BONUS;
          isBonusQualified = true;
          bonusReason = "Đạt thưởng tối đa";
      } else {
          bonusReason = `Mất thưởng do đi trễ ${lateCount} lần`;
      }
  } else {
      bonusReason = `Chưa đủ công (${workDays}/${MIN_DAYS_FOR_BONUS})`;
  }

  const totalIncome = actualSalary + bonus;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  return (
    <Card className="shadow-lg border-t-4 border-t-green-600 sticky top-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Calculator className="w-5 h-5 text-green-600" />
          Bảng lương tạm tính
        </CardTitle>
        <p className="text-xs text-gray-500">
            Tháng {currentMonth + 1}/{currentYear} • Công chuẩn: {STANDARD_WORK_DAYS}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Lương hợp đồng</span>
          <span className="font-semibold text-gray-900">{formatCurrency(baseSalary)}</span>
        </div>

        <Separator />

        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Số ngày làm việc</span>
                <Badge variant="outline" className={workDays >= 26 ? "text-green-600 border-green-200" : "text-blue-600 border-blue-200"}>
                    {workDays} / {STANDARD_WORK_DAYS} công
                </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Lương theo ngày</span>
                <span className="font-medium">{formatCurrency(actualSalary)}</span>
            </div>
        </div>

        <Separator />

        <div className="space-y-2 bg-yellow-50 p-3 rounded-md border border-yellow-100">
            <div className="flex justify-between items-center text-sm">
                <span className="text-yellow-700 font-medium flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Thưởng chuyên cần
                </span>
                <span className={isBonusQualified ? "text-green-600 font-bold" : "text-gray-400 font-bold"}>
                    {formatCurrency(bonus)}
                </span>
            </div>
            <div className="text-xs flex items-center gap-1">
                {isBonusQualified ? (
                    <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đủ điều kiện
                    </span>
                ) : (
                    <span className="text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {bonusReason}
                    </span>
                )}
            </div>
        </div>

        <Separator />

        <div className="pt-2">
            <div className="flex justify-between items-end">
                <span className="text-base font-bold text-gray-700">Thực lĩnh</span>
                <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalIncome)}
                </span>
            </div>
            <p className="text-[10px] text-gray-400 text-right mt-1">
                *Tự động cập nhật khi chấm công
            </p>
        </div>

      </CardContent>
    </Card>
  );
}