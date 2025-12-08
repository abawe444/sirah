import { useState } from 'react'
import { Employee } from '@/lib/types'
import { calculateStats, translations } from '@/lib/attendance'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { X, Gear, FloppyDisk } from '@phosphor-icons/react'
import { CENTERS } from '@/lib/attendance'
import { toast } from 'sonner'

interface EmployeeRowProps {
  employee: Employee
  onUpdateName: (id: number, name: string) => void
  onUpdateTime: (id: number, time: string) => void
  onUpdateCenter: (id: number, center: string) => void
  onDelete: (id: number) => void
  onUpdateSalary?: (id: number, salary: number) => void
  onUpdatePosition?: (id: number, position: string) => void
}

export function EmployeeRow({ 
  employee, 
  onUpdateName, 
  onUpdateTime, 
  onUpdateCenter, 
  onDelete,
  onUpdateSalary,
  onUpdatePosition
}: EmployeeRowProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedSalary, setEditedSalary] = useState(employee.salary?.toString() || '3500')
  const [editedPosition, setEditedPosition] = useState(employee.position || 'موظف')
  
  const calc = calculateStats(employee.time)
  
  const centerClass = employee.center.includes("الامريكي") 
    ? "bg-blue-100 text-blue-900 border-blue-900" 
    : employee.center.includes("الاوربي")
    ? "bg-orange-100 text-orange-900 border-orange-900"
    : "bg-green-100 text-green-900 border-green-900"

  const statusClass = (calc.status as string) === "غير محدد"
    ? "bg-gray-100 text-gray-600"
    : calc.style === "ok" 
    ? "bg-green-100 text-green-900" 
    : calc.style === "late"
    ? "bg-yellow-100 text-yellow-900"
    : "bg-red-100 text-red-900"

  const handleSaveEdits = () => {
    const salary = parseFloat(editedSalary)
    if (isNaN(salary) || salary < 0) {
      toast.error('الرجاء إدخال راتب صحيح')
      return
    }
    
    if (onUpdateSalary) {
      onUpdateSalary(employee.id, salary)
    }
    if (onUpdatePosition) {
      onUpdatePosition(employee.id, editedPosition)
    }
    
    setIsEditDialogOpen(false)
    toast.success('تم تحديث معلومات الموظف')
  }

  return (
    <>
      <tr className="hover:bg-accent/50 transition-colors">
        <td className="p-2 text-center no-print">
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8 text-primary hover:bg-primary/10"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Gear size={18} weight="bold" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:h-8 md:w-8 text-danger hover:bg-danger/10"
              onClick={() => onDelete(employee.id)}
            >
              <X size={18} weight="bold" />
            </Button>
          </div>
        </td>
      <td className="p-2 text-center">
        <Input
          value={employee.name}
          onChange={(e) => onUpdateName(employee.id, e.target.value)}
          className="text-center font-bold border-transparent hover:border-primary focus:border-primary text-sm md:text-base"
        />
      </td>
      <td className="p-2 text-center hidden md:table-cell">
        <Select 
          value={employee.center} 
          onValueChange={(val) => onUpdateCenter(employee.id, val)}
        >
          <SelectTrigger className={`${centerClass} font-bold text-xs border-0`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CENTERS.US}>{CENTERS.US}</SelectItem>
            <SelectItem value={CENTERS.EU}>{CENTERS.EU}</SelectItem>
            <SelectItem value={CENTERS.MAIN}>{CENTERS.MAIN}</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="p-2 text-center">
        <Input
          type="time"
          value={employee.time}
          onChange={(e) => onUpdateTime(employee.id, e.target.value)}
          placeholder="غير محدد"
          className={`w-20 md:w-24 mx-auto text-center font-bold text-sm md:text-base ${calc.deduction > 0 ? 'text-danger' : employee.time ? 'text-success' : 'text-muted-foreground'}`}
        />
      </td>
      <td className={`p-2 text-center font-bold hidden sm:table-cell ${calc.delay > 0 ? 'text-warning' : 'text-secondary'}`}>
        {calc.delay}
      </td>
      <td className="p-2 text-center">
        <Badge className={`${statusClass} font-extrabold text-xs px-2 md:px-3 py-1`}>
          {calc.status}
        </Badge>
      </td>
      <td className="p-2 text-center font-extrabold text-danger text-sm md:text-base">
        {calc.deduction > 0 ? `${calc.deduction} نقطة` : '-'}
      </td>
    </tr>

    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-primary">تعديل معلومات الموظف</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <Label className="block text-sm font-semibold mb-2">الاسم</Label>
            <div className="p-2 bg-accent rounded-md font-bold">{employee.name}</div>
          </div>
          
          <div>
            <Label htmlFor="salary" className="block text-sm font-semibold mb-2">الراتب الأساسي (ريال)</Label>
            <Input
              id="salary"
              type="number"
              value={editedSalary}
              onChange={(e) => setEditedSalary(e.target.value)}
              className="text-center font-bold"
              min="0"
            />
          </div>
          
          <div>
            <Label htmlFor="position" className="block text-sm font-semibold mb-2">المسمى الوظيفي</Label>
            <Input
              id="position"
              type="text"
              value={editedPosition}
              onChange={(e) => setEditedPosition(e.target.value)}
              className="text-center font-bold"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveEdits} className="flex-1 bg-success hover:bg-success/90 font-bold">
              <FloppyDisk size={20} weight="bold" className="ml-2" />
              حفظ التعديلات
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)} variant="outline" className="flex-1 font-bold">
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </>
  )
}
