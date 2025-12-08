import { Employee, CenterStats, Center } from '@/lib/types'
import { calculateStats, CENTERS, centerOrder } from '@/lib/attendance'
import { StatCard } from '@/components/StatCard'
import { CenterStatsCard } from '@/components/CenterStatsCard'
import { EmployeeRow } from '@/components/EmployeeRow'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Printer, ArrowClockwise, FloppyDisk, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DailyViewProps {
  employees: Employee[]
  onUpdateName: (id: number, name: string) => void
  onUpdateTime: (id: number, time: string) => void
  onUpdateCenter: (id: number, center: string) => void
  onDelete: (id: number) => void
  onAddEmployee: () => void
  onResetTimes: () => void
  onSetAllTimesTo8AM?: () => void
  onSetAllTimesToCustom?: (time: string) => void
  onSaveToday: () => void
  onUpdateEmployee?: (id: number, updates: Partial<Employee>) => void
}

export function DailyView({
  employees,
  onUpdateName,
  onUpdateTime,
  onUpdateCenter,
  onDelete,
  onAddEmployee,
  onResetTimes,
  onSetAllTimesTo8AM,
  onSetAllTimesToCustom,
  onSaveToday,
  onUpdateEmployee
}: DailyViewProps) {
  const sortEmployees = (emps: Employee[]) => {
    return [...emps].sort((a, b) => {
      const centerDiff = centerOrder.indexOf(a.center) - centerOrder.indexOf(b.center)
      if (centerDiff !== 0) return centerDiff
      return a.name.localeCompare(b.name, 'ar')
    })
  }

  const stats = employees.reduce(
    (acc, emp) => {
      const calc = calculateStats(emp.time)
      acc.total++
      if (calc.deduction > 0) {
        acc.late++
      } else {
        acc.present++
      }
      acc.totalDeductions += calc.deduction
      return acc
    },
    { total: 0, present: 0, late: 0, totalDeductions: 0 }
  )

  const centerStats = employees.reduce(
    (acc, emp) => {
      const calc = calculateStats(emp.time)
      if (!acc[emp.center]) {
        acc[emp.center] = { total: 0, late: 0, minutes: 0, deductions: 0 }
      }
      acc[emp.center].total++
      if (calc.deduction > 0) {
        acc[emp.center].late++
      }
      acc[emp.center].minutes += calc.delay
      acc[emp.center].deductions += calc.deduction
      return acc
    },
    {} as Record<Center, CenterStats>
  )

  const attendanceRate = stats.total > 0 
    ? Math.round((stats.present / stats.total) * 100) 
    : 0

  const sortedEmployees = sortEmployees(employees)

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        <StatCard value={stats.total} label="إجمالي الموظفين" />
        <StatCard value={stats.present} label="حضور في الموعد" color="success" />
        <StatCard value={`${attendanceRate}%`} label="نسبة الالتزام" color="primary" />
        <StatCard value={stats.late} label="حالات التأخير" color="danger" />
        <StatCard value={stats.totalDeductions} label="إجمالي الخصومات (نقاط)" color="warning" />
      </div>

      <Card className="p-3 md:p-4 mb-6 no-print shadow-md border border-primary/20">
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Button onClick={onSaveToday} className="bg-success hover:bg-success/90 font-bold flex-1 md:flex-none">
            <FloppyDisk size={20} weight="bold" className="ml-2" />
            حفظ اليوم
          </Button>
          <Button onClick={onAddEmployee} className="bg-primary hover:bg-primary/90 font-bold flex-1 md:flex-none">
            <Plus size={20} weight="bold" className="ml-2" />
            إضافة موظف
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-center-main hover:bg-center-main/90 text-white font-bold flex-1 md:flex-none">
                <Clock size={20} weight="bold" className="ml-2" />
                تعيين وقت للكل
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => onSetAllTimesToCustom?.("08:00")}
                className="font-bold cursor-pointer"
              >
                🕗 تعيين الكل 8 صباحاً
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onSetAllTimesToCustom?.("09:00")}
                className="font-bold cursor-pointer"
              >
                🕘 تعيين الكل 9 صباحاً
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onSetAllTimesToCustom?.("10:00")}
                className="font-bold cursor-pointer"
              >
                🕙 تعيين الكل 10 صباحاً
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onSetAllTimesToCustom?.("11:00")}
                className="font-bold cursor-pointer"
              >
                🕚 تعيين الكل 11 صباحاً
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onSetAllTimesToCustom?.("12:00")}
                className="font-bold cursor-pointer"
              >
                🕛 تعيين الكل 12 ظهراً
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => window.print()} className="bg-secondary hover:bg-secondary/90 font-bold flex-1 md:flex-none">
            <Printer size={20} weight="bold" className="ml-2" />
            طباعة
          </Button>
          <Button onClick={onResetTimes} variant="outline" className="font-bold flex-1 md:flex-none">
            <ArrowClockwise size={20} weight="bold" className="ml-2" />
            تصفير الأوقات
          </Button>
        </div>
      </Card>

      <div className="mb-6">
        <h3 className="text-base md:text-lg font-extrabold mb-4 text-primary border-r-4 border-primary pr-2">
          📊 إحصائيات المراكز
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <CenterStatsCard 
            name="المركز الأمريكي"
            stats={centerStats[CENTERS.US] || { total: 0, late: 0, minutes: 0, deductions: 0 }}
            color="border-r-center-us"
            icon="🏢"
          />
          <CenterStatsCard 
            name="المركز الأوروبي"
            stats={centerStats[CENTERS.EU] || { total: 0, late: 0, minutes: 0, deductions: 0 }}
            color="border-r-center-eu"
            icon="🏢"
          />
          <CenterStatsCard 
            name="المركز الرئيسي"
            stats={centerStats[CENTERS.MAIN] || { total: 0, late: 0, minutes: 0, deductions: 0 }}
            color="border-r-center-main"
            icon="🏢"
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-base md:text-lg font-extrabold mb-2 text-primary border-r-4 border-primary pr-2 bg-accent p-2 rounded">
          التقرير التفصيلي
        </h3>
        
        <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
          <div className="bg-accent p-3 md:p-4 border-b-2 border-primary/30 text-xs md:text-sm font-semibold">
            <div className="mb-2 font-extrabold text-primary">📋 قواعد الخصم:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              <div>⏰ حتى 08:30 - <span className="text-success font-extrabold">لا خصم</span></div>
              <div>⏰ 08:31 - 08:40 - <span className="text-warning font-extrabold">10 ريال</span></div>
              <div>⏰ 08:41 - 08:50 - <span className="text-warning font-extrabold">15 ريال</span></div>
              <div>⏰ 08:51 - 09:00 - <span className="text-danger font-extrabold">25 ريال</span></div>
              <div>⏰ بعد 09:00 - <span className="text-danger font-extrabold">45 ريال</span></div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30 no-print w-10"></th>
                  <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">الموظف</th>
                  <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30 hidden md:table-cell">المركز</th>
                  <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">وقت الحضور</th>
                  <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30 hidden sm:table-cell">تأخير (د)</th>
                  <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">الحالة</th>
                  <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">الخصم</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.map(emp => (
                  <EmployeeRow
                    key={emp.id}
                    employee={emp}
                    onUpdateName={onUpdateName}
                    onUpdateTime={onUpdateTime}
                    onUpdateCenter={onUpdateCenter}
                    onDelete={onDelete}
                    onUpdateSalary={onUpdateEmployee ? (id, salary) => onUpdateEmployee(id, { salary }) : undefined}
                    onUpdatePosition={onUpdateEmployee ? (id, position) => onUpdateEmployee(id, { position }) : undefined}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Card className="p-4 md:p-5 mt-6 text-center border-2 border-primary shadow-md no-print">
        <div className="text-base md:text-lg font-extrabold text-primary mb-2">📋 صادر عن:</div>
        <div className="text-sm md:text-base font-bold text-foreground mb-1">مكتب التقنية والانضباط</div>
        <div className="text-xs md:text-sm font-semibold text-secondary">المشرف: عبدالله أحمد الكردي</div>
      </Card>
    </div>
  )
}
