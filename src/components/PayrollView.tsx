import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Employee, DailyRecord, LeaveRequest, Advance, Bonus, CustomDeduction } from '@/lib/types'
import { calculateMonthlyDeductions } from '@/lib/recordsManager'
import { getEmployeeLeaveDays } from '@/lib/leaveManager'
import { getApprovedBonuses, calculateActiveAdvanceDeduction, getActiveCustomDeductions } from '@/lib/advanceManager'
import { PayrollRow } from '@/components/PayrollRow'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Printer, Trash, Money } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PayrollViewProps {
  employees: Employee[]
  records: Record<string, DailyRecord>
  onUpdateEmployee?: (employeeId: number, updates: Partial<Employee>) => void
}

export function PayrollView({ employees, records, onUpdateEmployee }: PayrollViewProps) {
  const [leaveRequests, setLeaveRequests] = useKV<LeaveRequest[]>('leaveRequests', [])
  const [advances, setAdvances] = useKV<Advance[]>('advances', [])
  const [bonuses, setBonuses] = useKV<Bonus[]>('bonuses', [])
  const [customDeductions, setCustomDeductions] = useKV<CustomDeduction[]>('customDeductions', [])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [showSetSalaryDialog, setShowSetSalaryDialog] = useState(false)
  const [uniformSalary, setUniformSalary] = useState<string>('3500')

  const monthlyDeductions = calculateMonthlyDeductions(records)
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  
  const totalWorkDays = Object.keys(records).filter(date => {
    const monthKey = new Date().toISOString().slice(0, 7)
    return date.startsWith(monthKey)
  }).length

  const totalBaseSalaries = employees.reduce((sum, emp) => sum + (emp.salary || 3500), 0)
  const totalDeductions = Object.values(monthlyDeductions).reduce((sum, md) => sum + md.totalDeductions, 0)
  
  let totalLeaveDaysDeduction = 0
  let totalAdvanceDeductions = 0
  let totalCustomDeductions = 0
  let totalBonusesAmount = 0
  
  employees.forEach(emp => {
    const { unpaidDays } = getEmployeeLeaveDays(emp.id, currentMonth, currentYear, leaveRequests || [])
    const dailySalary = (emp.salary || 3500) / 30
    totalLeaveDaysDeduction += unpaidDays * dailySalary
    
    totalAdvanceDeductions += calculateActiveAdvanceDeduction(emp.id, advances || [])
    totalBonusesAmount += getApprovedBonuses(emp.id, currentMonth, currentYear, bonuses || [])
    totalCustomDeductions += getActiveCustomDeductions(emp.id, customDeductions || [])
  })
  
  const allDeductions = totalDeductions + totalLeaveDaysDeduction + totalAdvanceDeductions + totalCustomDeductions
  const totalNetSalaries = totalBaseSalaries + totalBonusesAmount - allDeductions

  const selectedEmployee = selectedEmployeeId ? employees.find(e => e.id === selectedEmployeeId) : null

  const handleUpdateSalary = (employeeId: number, newSalary: number) => {
    if (onUpdateEmployee) {
      onUpdateEmployee(employeeId, { salary: newSalary })
    }
  }

  const handleDeleteAllLeaves = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع الإجازات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setLeaveRequests([])
      toast.success('تم حذف جميع الإجازات بنجاح')
    }
  }

  const handleDeleteAllDeductions = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع الخصومات المخصصة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setCustomDeductions([])
      toast.success('تم حذف جميع الخصومات بنجاح')
    }
  }

  const handleDeleteAllBonuses = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع المكافآت؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setBonuses([])
      toast.success('تم حذف جميع المكافآت بنجاح')
    }
  }

  const handleDeleteAllAdvances = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع السلف؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setAdvances([])
      toast.success('تم حذف جميع السلف بنجاح')
    }
  }

  const handleSetUniformSalary = () => {
    const salary = parseFloat(uniformSalary)
    if (isNaN(salary) || salary <= 0) {
      toast.error('يرجى إدخال راتب صحيح')
      return
    }

    if (window.confirm(`هل أنت متأكد من تحديد راتب ${salary} ريال لجميع الموظفين؟`)) {
      employees.forEach(emp => {
        if (onUpdateEmployee) {
          onUpdateEmployee(emp.id, { salary })
        }
      })
      setShowSetSalaryDialog(false)
      toast.success(`تم تحديد راتب ${salary} ريال لجميع الموظفين`)
    }
  }

  return (
    <div>
      <Card className="p-4 md:p-6 mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg md:text-xl font-extrabold text-primary">💰 ملخص الرواتب - الشهر الحالي</h3>
            <Button onClick={() => window.print()} className="bg-primary hover:bg-primary/90 font-bold no-print">
              <Printer size={20} weight="bold" className="ml-2" />
              طباعة
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 no-print">
            <Button 
              onClick={handleDeleteAllLeaves} 
              variant="destructive"
              size="sm"
              className="font-bold"
            >
              <Trash size={18} weight="bold" className="ml-2" />
              حذف جميع الإجازات
            </Button>
            
            <Button 
              onClick={handleDeleteAllDeductions} 
              variant="destructive"
              size="sm"
              className="font-bold"
            >
              <Trash size={18} weight="bold" className="ml-2" />
              حذف جميع الخصومات
            </Button>
            
            <Button 
              onClick={handleDeleteAllBonuses} 
              variant="destructive"
              size="sm"
              className="font-bold"
            >
              <Trash size={18} weight="bold" className="ml-2" />
              حذف جميع المكافآت
            </Button>
            
            <Button 
              onClick={handleDeleteAllAdvances} 
              variant="destructive"
              size="sm"
              className="font-bold"
            >
              <Trash size={18} weight="bold" className="ml-2" />
              حذف جميع السلف
            </Button>
            
            <Button 
              onClick={() => setShowSetSalaryDialog(true)} 
              variant="default"
              size="sm"
              className="bg-success hover:bg-success/90 font-bold"
            >
              <Money size={18} weight="bold" className="ml-2" />
              تحديد راتب للجميع
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
          <div className="text-center bg-white/50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">أيام العمل</div>
            <div className="text-2xl md:text-3xl font-extrabold text-primary">{totalWorkDays}</div>
          </div>
          <div className="text-center bg-white/50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">إجمالي الرواتب</div>
            <div className="text-2xl md:text-3xl font-extrabold text-success">{totalBaseSalaries.toFixed(0)}</div>
          </div>
          <div className="text-center bg-white/50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">المكافآت</div>
            <div className="text-2xl md:text-3xl font-extrabold text-success">+{totalBonusesAmount.toFixed(0)}</div>
          </div>
          <div className="text-center bg-white/50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">خصومات التأخير</div>
            <div className="text-2xl md:text-3xl font-extrabold text-danger">{totalDeductions.toFixed(0)}</div>
          </div>
          <div className="text-center bg-white/50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">خصومات أخرى</div>
            <div className="text-2xl md:text-3xl font-extrabold text-warning">{(totalLeaveDaysDeduction + totalAdvanceDeductions + totalCustomDeductions).toFixed(0)}</div>
          </div>
          <div className="text-center bg-white/50 rounded-lg p-3 md:p-4">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">صافي الرواتب</div>
            <div className="text-2xl md:text-3xl font-extrabold text-primary">{totalNetSalaries.toFixed(0)}</div>
          </div>
        </div>
      </Card>

      <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
        <div className="bg-accent p-3 md:p-4 border-b-2 border-primary/30">
          <h3 className="text-base md:text-lg font-extrabold text-primary">📊 تفاصيل الرواتب والخصومات</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent sticky top-0">
              <tr>
                <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">الموظف</th>
                <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30 hidden md:table-cell">المركز</th>
                <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">الراتب الأساسي</th>
                <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30 hidden sm:table-cell">أيام التأخير</th>
                <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30 hidden lg:table-cell">أيام الإجازات</th>
                <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">الخصومات</th>
                <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30 hidden lg:table-cell">نسبة الالتزام</th>
                <th className="p-2 md:p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">صافي الراتب</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <PayrollRow
                  key={emp.id}
                  employee={emp}
                  monthlyDeduction={monthlyDeductions[emp.id]}
                  totalWorkDays={totalWorkDays}
                  leaveRequests={leaveRequests || []}
                  advances={advances || []}
                  bonuses={bonuses || []}
                  customDeductions={customDeductions || []}
                  onOpenProfile={setSelectedEmployeeId}
                  onUpdateSalary={onUpdateEmployee ? handleUpdateSalary : undefined}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Card className="p-4 md:p-5 mt-6 text-center border-2 border-primary shadow-md">
        <div className="text-base md:text-lg font-extrabold text-primary mb-2">📋 تقرير الرواتب</div>
        <div className="text-sm md:text-base font-bold text-foreground mb-1">نظام صرح الإتقان المتكامل</div>
        <div className="text-xs md:text-sm font-semibold text-secondary">قسم الموارد البشرية والشؤون المالية</div>
      </Card>

      <Dialog open={showSetSalaryDialog} onOpenChange={setShowSetSalaryDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-primary">تحديد راتب موحد للجميع</DialogTitle>
            <DialogDescription className="text-base">
              سيتم تطبيق الراتب المحدد على جميع الموظفين
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">الراتب (ريال سعودي)</label>
              <Input
                type="number"
                value={uniformSalary}
                onChange={(e) => setUniformSalary(e.target.value)}
                placeholder="3500"
                className="text-lg font-bold text-center"
                min="0"
                step="100"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSetSalaryDialog(false)}
              className="font-bold"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSetUniformSalary}
              className="bg-success hover:bg-success/90 font-bold"
            >
              <Money size={18} weight="bold" className="ml-2" />
              تطبيق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
