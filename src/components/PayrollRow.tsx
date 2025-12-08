import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Employee, MonthlyDeduction, LeaveRequest, Advance, Bonus, CustomDeduction, DailyRecord } from '@/lib/types'
import { getEmployeeLeaveDays } from '@/lib/leaveManager'
import { 
  calculateActiveAdvanceDeduction, 
  getApprovedBonuses, 
  getActiveCustomDeductions 
} from '@/lib/advanceManager'
import { User, PencilSimple, FloppyDisk, X } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PayrollRowProps {
  employee: Employee
  monthlyDeduction: MonthlyDeduction | undefined
  totalWorkDays: number
  leaveRequests: LeaveRequest[]
  advances: Advance[]
  bonuses: Bonus[]
  customDeductions: CustomDeduction[]
  onOpenProfile: (employeeId: number) => void
  onUpdateSalary?: (employeeId: number, newSalary: number) => void
}

export function PayrollRow({ 
  employee, 
  monthlyDeduction, 
  totalWorkDays, 
  leaveRequests,
  advances,
  bonuses,
  customDeductions,
  onOpenProfile,
  onUpdateSalary
}: PayrollRowProps) {
  const [isEditingSalary, setIsEditingSalary] = useState(false)
  const [editedSalary, setEditedSalary] = useState(employee.salary?.toString() || '3500')
  
  const baseSalary = employee.salary || 3500
  const deductions = monthlyDeduction?.totalDeductions || 0
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  
  const { paidDays, unpaidDays } = getEmployeeLeaveDays(employee.id, currentMonth, currentYear, leaveRequests)
  const totalLeaveDays = paidDays + unpaidDays
  
  const dailySalary = baseSalary / 30
  const leaveDeductions = unpaidDays * dailySalary
  
  const advanceDeduction = calculateActiveAdvanceDeduction(employee.id, advances)
  const bonusAmount = getApprovedBonuses(employee.id, currentMonth, currentYear, bonuses)
  const customDeductionAmount = getActiveCustomDeductions(employee.id, customDeductions)
  
  const totalDeductions = deductions + leaveDeductions + advanceDeduction + customDeductionAmount
  const netSalary = baseSalary + bonusAmount - totalDeductions
  
  const daysLate = monthlyDeduction?.daysLate || 0
  const daysPresent = totalWorkDays - daysLate
  const attendanceRate = totalWorkDays > 0 ? Math.round((daysPresent / totalWorkDays) * 100) : 100

  const handleSaveSalary = () => {
    if (!onUpdateSalary) return
    
    const newSalary = parseFloat(editedSalary)
    if (isNaN(newSalary) || newSalary < 0) {
      toast.error('الرجاء إدخال راتب صحيح')
      return
    }
    
    onUpdateSalary(employee.id, newSalary)
    setIsEditingSalary(false)
    toast.success('تم تحديث الراتب بنجاح')
  }

  return (
    <tr className="border-b border-border hover:bg-accent/50 transition-colors">
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="font-bold">{employee.name}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 hover:bg-primary/10"
            onClick={() => onOpenProfile(employee.id)}
          >
            <User size={18} weight="bold" className="text-primary" />
          </Button>
        </div>
      </td>
      <td className="p-3 text-center text-sm text-muted-foreground hidden md:table-cell">{employee.center}</td>
      <td className="p-3 text-center">
        {isEditingSalary ? (
          <div className="flex items-center justify-center gap-1">
            <Input
              type="number"
              value={editedSalary}
              onChange={(e) => setEditedSalary(e.target.value)}
              className="w-24 h-8 text-center font-bold"
              min="0"
            />
            <Button size="sm" variant="ghost" onClick={handleSaveSalary} className="h-8 w-8 p-0 text-success hover:bg-success/10">
              <FloppyDisk size={16} weight="bold" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditingSalary(false)} className="h-8 w-8 p-0 text-danger hover:bg-danger/10">
              <X size={16} weight="bold" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1">
            <span className="font-bold text-primary">{baseSalary.toFixed(0)}</span>
            {onUpdateSalary && (
              <Button size="sm" variant="ghost" onClick={() => setIsEditingSalary(true)} className="h-8 w-8 p-0 hover:bg-primary/10">
                <PencilSimple size={16} weight="bold" className="text-primary" />
              </Button>
            )}
          </div>
        )}
      </td>
      <td className="p-3 text-center hidden sm:table-cell">
        <span className={`font-bold ${daysLate > 0 ? 'text-warning' : 'text-success'}`}>
          {daysLate}
        </span>
      </td>
      <td className="p-3 text-center hidden lg:table-cell">
        <span className={`font-bold ${totalLeaveDays > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
          {totalLeaveDays > 0 ? `${totalLeaveDays} (${unpaidDays} غ.م)` : '-'}
        </span>
      </td>
      <td className="p-3 text-center">
        <div className="text-xs text-muted-foreground mb-1">
          {bonusAmount > 0 && <div className="text-success">+{bonusAmount.toFixed(0)}</div>}
        </div>
        <span className={`font-bold ${totalDeductions > 0 ? 'text-danger' : 'text-success'}`}>
          {totalDeductions.toFixed(0)}
        </span>
      </td>
      <td className="p-3 text-center hidden lg:table-cell">
        <span className={`font-extrabold text-lg ${attendanceRate >= 90 ? 'text-success' : attendanceRate >= 70 ? 'text-warning' : 'text-danger'}`}>
          {attendanceRate}%
        </span>
      </td>
      <td className="p-3 text-center">
        <div className="font-extrabold text-lg text-primary">{netSalary.toFixed(0)}</div>
        <div className="text-xs text-muted-foreground">ريال</div>
      </td>
    </tr>
  )
}
