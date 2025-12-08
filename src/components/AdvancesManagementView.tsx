import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Employee, Advance, Bonus, CustomDeduction } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CurrencyCircleDollar, 
  TrendUp, 
  Plus, 
  Check, 
  X,
  Minus
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface AdvancesManagementViewProps {
  employees: Employee[]
}

export function AdvancesManagementView({ employees }: AdvancesManagementViewProps) {
  const [advances, setAdvances] = useKV<Advance[]>('advances', [])
  const [bonuses, setBonuses] = useKV<Bonus[]>('bonuses', [])
  const [customDeductions, setCustomDeductions] = useKV<CustomDeduction[]>('customDeductions', [])

  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false)
  const [bonusDialogOpen, setBonusDialogOpen] = useState(false)
  const [deductionDialogOpen, setDeductionDialogOpen] = useState(false)

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0)
  const [advanceAmount, setAdvanceAmount] = useState('')
  const [advanceReason, setAdvanceReason] = useState('')
  const [installments, setInstallments] = useState('12')
  
  const [bonusAmount, setBonusAmount] = useState('')
  const [bonusReason, setBonusReason] = useState('')
  const [bonusType, setBonusType] = useState<string>('مكافأة أداء')

  const [deductionAmount, setDeductionAmount] = useState('')
  const [deductionReason, setDeductionReason] = useState('')
  const [deductionType, setDeductionType] = useState<string>('خصم تأديبي')
  const [isRecurring, setIsRecurring] = useState(false)

  const addAdvance = () => {
    if (!selectedEmployeeId || !advanceAmount || !advanceReason) {
      toast.error('يرجى ملء جميع الحقول')
      return
    }

    const employee = employees.find(e => e.id === selectedEmployeeId)
    if (!employee) return

    const amount = parseFloat(advanceAmount)
    const installmentCount = parseInt(installments)
    const monthlyDeduction = amount / installmentCount

    const newAdvance: Advance = {
      id: Date.now().toString(),
      employeeId: selectedEmployeeId,
      employeeName: employee.name,
      amount,
      date: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      reason: advanceReason,
      status: 'معلق',
      monthlyInstallment: monthlyDeduction,
      totalInstallments: installmentCount,
      remainingInstallments: installmentCount,
      monthlyDeduction
    }

    setAdvances((current) => [...(current || []), newAdvance])
    toast.success('تم إضافة طلب السلفة بنجاح')
    setAdvanceDialogOpen(false)
    setAdvanceAmount('')
    setAdvanceReason('')
    setInstallments('12')
  }

  const approveAdvance = (id: string) => {
    setAdvances((current) =>
      (current || []).map(adv =>
        adv.id === id ? { ...adv, status: 'موافق عليه' as const, approvalDate: new Date().toISOString().split('T')[0] } : adv
      )
    )
    toast.success('تم الموافقة على السلفة')
  }

  const rejectAdvance = (id: string) => {
    setAdvances((current) =>
      (current || []).map(adv =>
        adv.id === id ? { ...adv, status: 'مرفوض' as const } : adv
      )
    )
    toast.error('تم رفض السلفة')
  }

  const addBonus = () => {
    if (!selectedEmployeeId || !bonusAmount || !bonusReason) {
      toast.error('يرجى ملء جميع الحقول')
      return
    }

    const employee = employees.find(e => e.id === selectedEmployeeId)
    if (!employee) return

    const newBonus: Bonus = {
      id: Date.now().toString(),
      employeeId: selectedEmployeeId,
      employeeName: employee.name,
      amount: parseFloat(bonusAmount),
      date: new Date().toISOString().split('T')[0],
      reason: bonusReason,
      type: bonusType as any,
      status: 'معلق'
    }

    setBonuses((current) => [...(current || []), newBonus])
    toast.success('تم إضافة المكافأة بنجاح')
    setBonusDialogOpen(false)
    setBonusAmount('')
    setBonusReason('')
  }

  const approveBonus = (id: string) => {
    setBonuses((current) =>
      (current || []).map(bonus =>
        bonus.id === id ? { ...bonus, status: 'موافق عليه' as const, approvalDate: new Date().toISOString().split('T')[0] } : bonus
      )
    )
    toast.success('تم الموافقة على المكافأة')
  }

  const rejectBonus = (id: string) => {
    setBonuses((current) =>
      (current || []).map(bonus =>
        bonus.id === id ? { ...bonus, status: 'مرفوض' as const } : bonus
      )
    )
    toast.error('تم رفض المكافأة')
  }

  const addCustomDeduction = () => {
    if (!selectedEmployeeId || !deductionAmount || !deductionReason) {
      toast.error('يرجى ملء جميع الحقول')
      return
    }

    const employee = employees.find(e => e.id === selectedEmployeeId)
    if (!employee) return

    const newDeduction: CustomDeduction = {
      id: Date.now().toString(),
      employeeId: selectedEmployeeId,
      employeeName: employee.name,
      amount: parseFloat(deductionAmount),
      date: new Date().toISOString().split('T')[0],
      reason: deductionReason,
      type: deductionType as any,
      isRecurring,
      status: 'نشط'
    }

    setCustomDeductions((current) => [...(current || []), newDeduction])
    toast.success('تم إضافة الخصم بنجاح')
    setDeductionDialogOpen(false)
    setDeductionAmount('')
    setDeductionReason('')
    setIsRecurring(false)
  }

  const toggleDeductionStatus = (id: string) => {
    setCustomDeductions((current) =>
      (current || []).map(ded =>
        ded.id === id ? { ...ded, status: ded.status === 'نشط' ? 'مكتمل' as const : 'نشط' as const } : ded
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary">السلف</h3>
            <Dialog open={advanceDialogOpen} onOpenChange={setAdvanceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary">
                  <Plus size={18} weight="bold" className="ml-1" />
                  إضافة سلفة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-primary">إضافة سلفة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>الموظف</Label>
                    <Select value={selectedEmployeeId.toString()} onValueChange={(v) => setSelectedEmployeeId(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر موظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المبلغ</Label>
                    <Input 
                      type="number" 
                      value={advanceAmount} 
                      onChange={(e) => setAdvanceAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>عدد الأقساط</Label>
                    <Input 
                      type="number" 
                      value={installments} 
                      onChange={(e) => setInstallments(e.target.value)}
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <Label>السبب</Label>
                    <Textarea 
                      value={advanceReason} 
                      onChange={(e) => setAdvanceReason(e.target.value)}
                      placeholder="سبب طلب السلفة"
                      rows={3}
                    />
                  </div>
                  <Button onClick={addAdvance} className="w-full bg-primary">
                    إضافة السلفة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="text-3xl font-extrabold text-primary mb-2">
            {(advances || []).filter(a => a.status === 'موافق عليه').length}
          </div>
          <div className="text-sm text-muted-foreground">سلفة نشطة</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-success/10 to-success/5 border-2 border-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-success">المكافآت</h3>
            <Dialog open={bonusDialogOpen} onOpenChange={setBonusDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-success text-white">
                  <Plus size={18} weight="bold" className="ml-1" />
                  إضافة مكافأة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-success">إضافة مكافأة جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>الموظف</Label>
                    <Select value={selectedEmployeeId.toString()} onValueChange={(v) => setSelectedEmployeeId(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر موظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>نوع المكافأة</Label>
                    <Select value={bonusType} onValueChange={setBonusType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مكافأة أداء">مكافأة أداء</SelectItem>
                        <SelectItem value="مكافأة حضور">مكافأة حضور</SelectItem>
                        <SelectItem value="مكافأة إنجاز">مكافأة إنجاز</SelectItem>
                        <SelectItem value="مكافأة عيد">مكافأة عيد</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المبلغ</Label>
                    <Input 
                      type="number" 
                      value={bonusAmount} 
                      onChange={(e) => setBonusAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>السبب</Label>
                    <Textarea 
                      value={bonusReason} 
                      onChange={(e) => setBonusReason(e.target.value)}
                      placeholder="سبب المكافأة"
                      rows={3}
                    />
                  </div>
                  <Button onClick={addBonus} className="w-full bg-success text-white">
                    إضافة المكافأة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="text-3xl font-extrabold text-success mb-2">
            {(bonuses || []).filter(b => b.status === 'موافق عليه').length}
          </div>
          <div className="text-sm text-muted-foreground">مكافأة مُعتمدة</div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-danger/10 to-danger/5 border-2 border-danger">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-danger">الخصومات</h3>
            <Dialog open={deductionDialogOpen} onOpenChange={setDeductionDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-danger text-white">
                  <Plus size={18} weight="bold" className="ml-1" />
                  إضافة خصم
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-danger">إضافة خصم جديد</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>الموظف</Label>
                    <Select value={selectedEmployeeId.toString()} onValueChange={(v) => setSelectedEmployeeId(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر موظف" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>نوع الخصم</Label>
                    <Select value={deductionType} onValueChange={setDeductionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="خصم تأديبي">خصم تأديبي</SelectItem>
                        <SelectItem value="خصم تأمينات">خصم تأمينات</SelectItem>
                        <SelectItem value="خصم قروض">خصم قروض</SelectItem>
                        <SelectItem value="خصم أخرى">خصم أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>المبلغ</Label>
                    <Input 
                      type="number" 
                      value={deductionAmount} 
                      onChange={(e) => setDeductionAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>السبب</Label>
                    <Textarea 
                      value={deductionReason} 
                      onChange={(e) => setDeductionReason(e.target.value)}
                      placeholder="سبب الخصم"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="recurring"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="recurring">خصم شهري متكرر</Label>
                  </div>
                  <Button onClick={addCustomDeduction} className="w-full bg-danger text-white">
                    إضافة الخصم
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="text-3xl font-extrabold text-danger mb-2">
            {(customDeductions || []).filter(d => d.status === 'نشط').length}
          </div>
          <div className="text-sm text-muted-foreground">خصم نشط</div>
        </Card>
      </div>

      <Tabs defaultValue="advances" dir="rtl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="advances">
            <CurrencyCircleDollar size={20} weight="bold" className="ml-2" />
            السلف
          </TabsTrigger>
          <TabsTrigger value="bonuses">
            <TrendUp size={20} weight="bold" className="ml-2" />
            المكافآت
          </TabsTrigger>
          <TabsTrigger value="deductions">
            <Minus size={20} weight="bold" className="ml-2" />
            الخصومات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="advances" className="space-y-3">
          {(advances || []).length === 0 ? (
            <Card className="p-8 text-center">
              <CurrencyCircleDollar size={64} weight="light" className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">لا توجد سلف مسجلة</p>
            </Card>
          ) : (
            (advances || []).map(advance => (
              <Card key={advance.id} className="p-4 border-r-4 border-r-primary">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg">{advance.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{advance.reason}</div>
                  </div>
                  <Badge variant={
                    advance.status === 'موافق عليه' ? 'default' : 
                    advance.status === 'مرفوض' ? 'destructive' : 'secondary'
                  }>
                    {advance.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">المبلغ</div>
                    <div className="font-bold text-primary">{advance.amount.toFixed(0)} ريال</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">القسط الشهري</div>
                    <div className="font-bold text-danger">{(advance.monthlyDeduction || advance.monthlyInstallment || 0).toFixed(0)} ريال</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">عدد الأقساط</div>
                    <div className="font-bold">{advance.installments || advance.totalInstallments}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">المتبقي</div>
                    <div className="font-bold text-warning">{advance.remainingInstallments} قسط</div>
                  </div>
                </div>
                {advance.status === 'معلق' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-success text-white flex-1"
                      onClick={() => approveAdvance(advance.id)}
                    >
                      <Check size={18} weight="bold" className="ml-1" />
                      موافقة
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => rejectAdvance(advance.id)}
                    >
                      <X size={18} weight="bold" className="ml-1" />
                      رفض
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="bonuses" className="space-y-3">
          {(bonuses || []).length === 0 ? (
            <Card className="p-8 text-center">
              <TrendUp size={64} weight="light" className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">لا توجد مكافآت مسجلة</p>
            </Card>
          ) : (
            (bonuses || []).map(bonus => (
              <Card key={bonus.id} className="p-4 border-r-4 border-r-success">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg">{bonus.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{bonus.reason}</div>
                  </div>
                  <Badge variant={
                    bonus.status === 'موافق عليه' ? 'default' : 
                    bonus.status === 'مرفوض' ? 'destructive' : 'secondary'
                  }>
                    {bonus.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">المبلغ</div>
                    <div className="font-bold text-success">+{bonus.amount.toFixed(0)} ريال</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">النوع</div>
                    <div className="font-bold">{bonus.type}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">التاريخ</div>
                    <div className="font-bold">{bonus.date}</div>
                  </div>
                </div>
                {bonus.status === 'معلق' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-success text-white flex-1"
                      onClick={() => approveBonus(bonus.id)}
                    >
                      <Check size={18} weight="bold" className="ml-1" />
                      موافقة
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => rejectBonus(bonus.id)}
                    >
                      <X size={18} weight="bold" className="ml-1" />
                      رفض
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="deductions" className="space-y-3">
          {(customDeductions || []).length === 0 ? (
            <Card className="p-8 text-center">
              <Minus size={64} weight="light" className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">لا توجد خصومات إضافية</p>
            </Card>
          ) : (
            (customDeductions || []).map(deduction => (
              <Card key={deduction.id} className="p-4 border-r-4 border-r-danger">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg">{deduction.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{deduction.reason}</div>
                  </div>
                  <Badge variant={deduction.status === 'نشط' ? 'destructive' : 'secondary'}>
                    {deduction.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">المبلغ</div>
                    <div className="font-bold text-danger">-{deduction.amount.toFixed(0)} ريال</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">النوع</div>
                    <div className="font-bold">{deduction.type}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">التاريخ</div>
                    <div className="font-bold">{deduction.date}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={deduction.status === 'نشط' ? 'outline' : 'default'}
                    className="flex-1"
                    onClick={() => toggleDeductionStatus(deduction.id)}
                  >
                    {deduction.status === 'نشط' ? 'إيقاف' : 'تفعيل'}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
