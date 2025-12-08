import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { LeaveRequest, LeaveType, Employee } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, CheckCircle, Clock, XCircle, Plus, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LeaveViewProps {
  employees: Employee[]
}

export function LeaveView({ employees }: LeaveViewProps) {
  const [leaveRequests, setLeaveRequests] = useKV<LeaveRequest[]>('leaveRequests', [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('')
  const [leaveType, setLeaveType] = useState<LeaveType>('إجازة سنوية')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0
    const startD = new Date(start)
    const endD = new Date(end)
    const diff = Math.ceil((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24))
    return diff + 1
  }

  const handleSubmit = () => {
    if (!selectedEmployeeId || !startDate || !endDate || !reason) {
      toast.error('الرجاء ملء جميع الحقول')
      return
    }

    const employee = employees.find(e => e.id === Number(selectedEmployeeId))
    if (!employee) return

    const days = calculateDays(startDate, endDate)
    if (days <= 0) {
      toast.error('تاريخ النهاية يجب أن يكون بعد تاريخ البداية')
      return
    }

    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: employee.id,
      employeeName: employee.name,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: 'معلق',
      requestDate: new Date().toISOString().split('T')[0]
    }

    setLeaveRequests((current) => [...(current || []), newRequest])
    toast.success('تم إرسال طلب الإجازة بنجاح')
    
    setIsDialogOpen(false)
    setSelectedEmployeeId('')
    setStartDate('')
    setEndDate('')
    setReason('')
  }

  const approveLeave = (id: string) => {
    setLeaveRequests((current) =>
      (current || []).map(req =>
        req.id === id
          ? { ...req, status: 'موافق عليه' as const, approvalDate: new Date().toISOString().split('T')[0] }
          : req
      )
    )
    toast.success('تمت الموافقة على الإجازة')
  }

  const rejectLeave = (id: string) => {
    setLeaveRequests((current) =>
      (current || []).map(req =>
        req.id === id
          ? { ...req, status: 'مرفوض' as const, approvalDate: new Date().toISOString().split('T')[0] }
          : req
      )
    )
    toast.success('تم رفض الإجازة')
  }

  const deleteLeave = (id: string) => {
    setLeaveRequests((current) => (current || []).filter(req => req.id !== id))
    toast.success('تم حذف طلب الإجازة')
  }

  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case 'إجازة مرضية': return 'bg-destructive/10 text-destructive'
      case 'إجازة سنوية': return 'bg-success/10 text-[oklch(0.65_0.22_142)]'
      case 'إجازة طارئة': return 'bg-warning/10 text-[oklch(0.75_0.15_75)]'
      case 'إجازة بدون راتب': return 'bg-secondary/10 text-secondary'
    }
  }

  const getStatusBadge = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'معلق':
        return <Badge className="bg-warning/20 text-[oklch(0.75_0.15_75)]"><Clock size={14} className="ml-1" weight="bold" />معلق</Badge>
      case 'موافق عليه':
        return <Badge className="bg-success/20 text-[oklch(0.65_0.22_142)]"><CheckCircle size={14} className="ml-1" weight="bold" />موافق عليه</Badge>
      case 'مرفوض':
        return <Badge className="bg-destructive/20 text-destructive"><XCircle size={14} className="ml-1" weight="bold" />مرفوض</Badge>
    }
  }

  const pendingRequests = (leaveRequests || []).filter(r => r.status === 'معلق')
  const approvedRequests = (leaveRequests || []).filter(r => r.status === 'موافق عليه')
  const rejectedRequests = (leaveRequests || []).filter(r => r.status === 'مرفوض')

  const totalLeaveDays = approvedRequests.reduce((sum, req) => sum + req.days, 0)

  const getEmployeeLeaveStats = (employeeId: number) => {
    const approved = (leaveRequests || []).filter(r => r.employeeId === employeeId && r.status === 'موافق عليه')
    return {
      total: approved.reduce((sum, req) => sum + req.days, 0),
      sick: approved.filter(r => r.leaveType === 'إجازة مرضية').reduce((sum, req) => sum + req.days, 0),
      annual: approved.filter(r => r.leaveType === 'إجازة سنوية').reduce((sum, req) => sum + req.days, 0),
      emergency: approved.filter(r => r.leaveType === 'إجازة طارئة').reduce((sum, req) => sum + req.days, 0),
      unpaid: approved.filter(r => r.leaveType === 'إجازة بدون راتب').reduce((sum, req) => sum + req.days, 0)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-foreground">نظام الإجازات والغياب</h2>
          <p className="text-sm text-muted-foreground mt-1">إدارة طلبات الإجازات ومتابعة حالة الموظفين</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground w-full md:w-auto">
              <Plus size={20} weight="bold" className="ml-2" />
              طلب إجازة جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold">طلب إجازة جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="employee">الموظف</Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name} - {emp.center}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveType">نوع الإجازة</Label>
                <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
                  <SelectTrigger id="leaveType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="إجازة سنوية">إجازة سنوية</SelectItem>
                    <SelectItem value="إجازة مرضية">إجازة مرضية</SelectItem>
                    <SelectItem value="إجازة طارئة">إجازة طارئة</SelectItem>
                    <SelectItem value="إجازة بدون راتب">إجازة بدون راتب</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate">تاريخ البداية</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">تاريخ النهاية</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="text-sm text-center p-2 bg-muted rounded-lg">
                  المدة: <span className="font-bold text-primary">{calculateDays(startDate, endDate)} يوم</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">السبب</Label>
                <Textarea
                  id="reason"
                  placeholder="اكتب سبب الإجازة..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full bg-primary">
                إرسال الطلب
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-r-4 border-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">طلبات معلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold text-warning">{pendingRequests.length}</div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-success">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجازات موافق عليها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold text-[oklch(0.65_0.22_142)]">{approvedRequests.length}</div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">طلبات مرفوضة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold text-destructive">{rejectedRequests.length}</div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي أيام الإجازات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-extrabold text-primary">{totalLeaveDays}</div>
          </CardContent>
        </Card>
      </div>

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-extrabold flex items-center gap-2">
              <Clock size={24} weight="bold" className="text-warning" />
              طلبات معلقة ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req.id} className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-foreground">{req.employeeName}</span>
                        <Badge className={getLeaveTypeColor(req.leaveType)}>{req.leaveType}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} weight="bold" />
                          من {req.startDate} إلى {req.endDate} ({req.days} يوم)
                        </div>
                        <div>السبب: {req.reason}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveLeave(req.id)}
                        className="bg-success text-white"
                      >
                        <CheckCircle size={16} weight="bold" className="ml-1" />
                        موافقة
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectLeave(req.id)}
                      >
                        <XCircle size={16} weight="bold" className="ml-1" />
                        رفض
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-extrabold">جميع الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {(leaveRequests || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar size={48} className="mx-auto mb-3 opacity-50" />
              <p>لا توجد طلبات إجازة حتى الآن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-right font-bold">الموظف</th>
                    <th className="p-3 text-right font-bold">نوع الإجازة</th>
                    <th className="p-3 text-right font-bold">التاريخ</th>
                    <th className="p-3 text-center font-bold">الأيام</th>
                    <th className="p-3 text-center font-bold">الحالة</th>
                    <th className="p-3 text-center font-bold no-print">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {(leaveRequests || []).map(req => (
                    <tr key={req.id} className="border-b hover:bg-accent/5 transition-colors">
                      <td className="p-3 font-semibold">{req.employeeName}</td>
                      <td className="p-3">
                        <Badge className={getLeaveTypeColor(req.leaveType)}>{req.leaveType}</Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {req.startDate} → {req.endDate}
                      </td>
                      <td className="p-3 text-center font-bold">{req.days}</td>
                      <td className="p-3 text-center">{getStatusBadge(req.status)}</td>
                      <td className="p-3 text-center no-print">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteLeave(req.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash size={16} weight="bold" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-extrabold">إحصائيات الإجازات للموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-right font-bold">الموظف</th>
                  <th className="p-3 text-center font-bold">المركز</th>
                  <th className="p-3 text-center font-bold">إجمالي الأيام</th>
                  <th className="p-3 text-center font-bold">إجازة سنوية</th>
                  <th className="p-3 text-center font-bold">إجازة مرضية</th>
                  <th className="p-3 text-center font-bold">إجازة طارئة</th>
                  <th className="p-3 text-center font-bold">بدون راتب</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const stats = getEmployeeLeaveStats(emp.id)
                  return (
                    <tr key={emp.id} className="border-b hover:bg-accent/5 transition-colors">
                      <td className="p-3 font-semibold">{emp.name}</td>
                      <td className="p-3 text-center text-sm text-muted-foreground">{emp.center}</td>
                      <td className="p-3 text-center font-bold text-primary">{stats.total}</td>
                      <td className="p-3 text-center">{stats.annual || '-'}</td>
                      <td className="p-3 text-center">{stats.sick || '-'}</td>
                      <td className="p-3 text-center">{stats.emergency || '-'}</td>
                      <td className="p-3 text-center">{stats.unpaid || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
