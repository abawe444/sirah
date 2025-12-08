import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'
import { Pencil, Trash, ArrowCounterClockwise } from '@phosphor-icons/react'
import { DailyRecord, DailyAttendance } from '@/lib/types'
import { HistoryCard } from '@/components/HistoryCard'

interface HistoryViewProps {
  records: Record<string, DailyRecord>
  onUpdateRecord?: (date: string, updatedRecord: DailyRecord) => void
  onDeleteRecord?: (date: string) => void
}

export function HistoryView({ records, onUpdateRecord, onDeleteRecord }: HistoryViewProps) {
  const [selectedRecord, setSelectedRecord] = useState<DailyRecord | null>(null)
  const [editingAttendance, setEditingAttendance] = useState<DailyAttendance | null>(null)
  const [editedTime, setEditedTime] = useState('')
  const [editedDeduction, setEditedDeduction] = useState('')

  // ترتيب السجلات حسب التاريخ تنازلياً
  const sortedRecords = Object.values(records).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // حساب الإحصائيات الشهرية
  const monthlyStats = sortedRecords.reduce(
    (acc, record) => {
      acc.totalDays++
      acc.totalPresent += record.stats.present
      acc.totalLate += record.stats.late
      acc.totalAbsent += record.stats.absent || 0
      acc.totalDeductions += record.stats.totalDeductions
      return acc
    },
    { totalDays: 0, totalPresent: 0, totalLate: 0, totalAbsent: 0, totalDeductions: 0 }
  )

  const handleEditAttendance = (attendance: DailyAttendance) => {
    setEditingAttendance(attendance)
    setEditedTime(attendance.time)
    setEditedDeduction((attendance.deduction || 0).toString())
  }

  const handleSaveEdit = () => {
    if (!selectedRecord || !editingAttendance) return

    const updatedAttendance = (selectedRecord.attendance || []).map(att =>
      att.employeeId === editingAttendance.employeeId
        ? { ...att, time: editedTime, deduction: parseFloat(editedDeduction) || 0 }
        : att
    )

    const updatedStats = {
      ...selectedRecord.stats,
      totalDeductions: updatedAttendance.reduce((sum, att) => sum + (att.deduction || 0), 0)
    }

    const updatedRecord: DailyRecord = {
      ...selectedRecord,
      attendance: updatedAttendance,
      stats: updatedStats
    }

    onUpdateRecord?.(selectedRecord.date, updatedRecord)
    setEditingAttendance(null)
    setSelectedRecord(updatedRecord)
    toast.success('تم تحديث البيانات بنجاح')
  }

  const handleDeleteRecord = () => {
    if (!selectedRecord) return
    onDeleteRecord?.(selectedRecord.date)
    setSelectedRecord(null)
    toast.success('تم حذف السجل بنجاح')
  }

  const handleResetRecord = () => {
    if (!selectedRecord) return

    const resetAttendance = (selectedRecord.attendance || []).map(att => ({
      ...att,
      time: '',
      delay: 0,
      deduction: 0,
      status: 'غياب' as const
    }))

    const resetStats = {
      total: selectedRecord.stats.total,
      totalEmployees: selectedRecord.stats.totalEmployees || selectedRecord.stats.total,
      present: 0,
      late: 0,
      absent: selectedRecord.stats.total,
      totalDeductions: 0
    }

    const resetRecord: DailyRecord = {
      ...selectedRecord,
      attendance: resetAttendance,
      stats: resetStats
    }

    onUpdateRecord?.(selectedRecord.date, resetRecord)
    setSelectedRecord(resetRecord)
    toast.success('تم تصفير السجل بنجاح')
  }

  return (
    <div className="space-y-6">
      {/* بطاقة الإحصائيات العلوية */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <h2 className="text-xl md:text-2xl font-extrabold text-primary mb-4">
          إحصائيات شهرية
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-card p-3 md:p-4 rounded-lg shadow-sm text-center">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">إجمالي الأيام</div>
            <div className="text-2xl md:text-3xl font-extrabold text-primary">{monthlyStats.totalDays}</div>
          </div>
          <div className="bg-card p-3 md:p-4 rounded-lg shadow-sm text-center">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">حضور</div>
            <div className="text-2xl md:text-3xl font-extrabold text-success">{monthlyStats.totalPresent}</div>
          </div>
          <div className="bg-card p-3 md:p-4 rounded-lg shadow-sm text-center">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">تأخير</div>
            <div className="text-2xl md:text-3xl font-extrabold text-warning">{monthlyStats.totalLate}</div>
          </div>
          <div className="bg-card p-3 md:p-4 rounded-lg shadow-sm text-center">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">غياب</div>
            <div className="text-2xl md:text-3xl font-extrabold text-danger">{monthlyStats.totalAbsent}</div>
          </div>
          <div className="bg-card p-3 md:p-4 rounded-lg shadow-sm text-center col-span-2 md:col-span-1">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">إجمالي الخصومات</div>
            <div className="text-2xl md:text-3xl font-extrabold text-destructive">{monthlyStats.totalDeductions} نقطة</div>
          </div>
        </div>
      </Card>

      <h3 className="text-base md:text-lg font-extrabold text-foreground">
        السجلات اليومية ({sortedRecords.length})
      </h3>

      {/* قائمة البطاقات */}
      <div className="grid gap-4 md:gap-6">
        {sortedRecords.map(record => (
          <HistoryCard
            key={record.date}
            record={record}
            onClick={() => setSelectedRecord(record)}
          />
        ))}
      </div>

      {/* نافذة التفاصيل (Dialog) */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <div className="flex justify-between items-start gap-2">
              <DialogTitle className="text-xl md:text-2xl font-extrabold">
                تفاصيل يوم {selectedRecord && format(new Date(selectedRecord.date), 'EEEE، d MMMM yyyy', { locale: ar })}
              </DialogTitle>
              <div className="flex gap-2">
                {onUpdateRecord && (
                  <Button
                    variant="outline"
                    onClick={handleResetRecord}
                    size="sm"
                    className="gap-2"
                  >
                    <ArrowCounterClockwise />
                    <span className="hidden sm:inline">تصفير السجل</span>
                  </Button>
                )}
                {onDeleteRecord && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteRecord}
                    size="sm"
                    className="gap-2"
                  >
                    <Trash />
                    <span className="hidden sm:inline">حذف السجل</span>
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              {/* إحصائيات اليوم المحدد */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-success/10 rounded-lg p-3 text-center">
                  <div className="text-xl md:text-2xl font-extrabold text-success">{selectedRecord.stats.present}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">حضور</div>
                </div>
                <div className="bg-warning/10 rounded-lg p-3 text-center">
                  <div className="text-xl md:text-2xl font-extrabold text-warning">{selectedRecord.stats.late}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">تأخير</div>
                </div>
                <div className="bg-danger/10 rounded-lg p-3 text-center">
                  <div className="text-xl md:text-2xl font-extrabold text-danger">{selectedRecord.stats.absent}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">غياب</div>
                </div>
                <div className="bg-destructive/10 rounded-lg p-3 text-center">
                  <div className="text-xl md:text-2xl font-extrabold text-destructive">{selectedRecord.stats.totalDeductions}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">نقطة</div>
                </div>
              </div>

              {/* جدول الموظفين */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 md:p-3 text-center text-xs md:text-sm font-bold">الموظف</th>
                      <th className="p-2 md:p-3 text-center text-xs md:text-sm font-bold">المركز</th>
                      <th className="p-2 md:p-3 text-center text-xs md:text-sm font-bold">الوقت</th>
                      <th className="p-2 md:p-3 text-center text-xs md:text-sm font-bold">الحالة</th>
                      <th className="p-2 md:p-3 text-center text-xs md:text-sm font-bold">التأخير</th>
                      <th className="p-2 md:p-3 text-center text-xs md:text-sm font-bold">الخصم</th>
                      {onUpdateRecord && (
                        <th className="p-2 md:p-3 text-center text-xs md:text-sm font-bold">إجراءات</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedRecord.attendance || []).map((att, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2 md:p-3 text-center font-bold">{att.name}</td>
                        <td className="p-2 md:p-3 text-center text-xs md:text-sm">{att.center}</td>
                        <td className="p-2 md:p-3 text-center font-mono">{att.time}</td>
                        <td className="p-2 md:p-3 text-center">
                          <span className={`px-2 py-1 rounded-md text-xs md:text-sm font-bold ${
                            att.status === 'حضور' ? 'bg-success/20 text-success' :
                            att.status === 'تأخير' ? 'bg-warning/20 text-warning' :
                            att.status === 'غياب' ? 'bg-danger/20 text-danger' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {att.status}
                          </span>
                        </td>
                        <td className="p-2 md:p-3 text-center">
                          <span className={`font-bold ${
                            (att.delay || 0) > 30 ? 'text-danger' :
                            (att.delay || 0) > 15 ? 'text-warning' :
                            'text-muted-foreground'
                          }`}>
                            {(att.delay || 0) > 0 ? `${att.delay} دقيقة` : '-'}
                          </span>
                        </td>
                        <td className="p-2 md:p-3 text-center">
                          <span className={`font-bold ${
                            (att.deduction || 0) > 30 ? 'text-danger' :
                            (att.deduction || 0) > 15 ? 'text-warning' :
                            (att.deduction || 0) > 0 ? 'text-warning' :
                            'text-muted-foreground'
                          }`}>
                            {(att.deduction || 0) > 0 ? `${att.deduction} نقطة` : '-'}
                          </span>
                        </td>
                        {onUpdateRecord && (
                          <td className="p-2 md:p-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAttendance(att)}
                            >
                              <Pencil size={16} />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة التعديل (Edit Dialog) */}
      <Dialog open={!!editingAttendance} onOpenChange={() => setEditingAttendance(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الحضور</DialogTitle>
          </DialogHeader>
          {editingAttendance && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">الموظف</label>
                <div className="p-2 bg-muted rounded">{editingAttendance.name}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">الوقت</label>
                <Input
                  type="time"
                  value={editedTime}
                  onChange={(e) => setEditedTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">الخصم (ريال)</label>
                <Input
                  type="number"
                  value={editedDeduction}
                  onChange={(e) => setEditedDeduction(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingAttendance(null)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveEdit}>
                  حفظ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}