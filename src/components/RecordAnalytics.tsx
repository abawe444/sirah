import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DailyRecord, Employee } from '@/lib/types'
import { ChartBar, TrendUp, Users, Calendar, Download, FileText } from '@phosphor-icons/react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

interface RecordAnalyticsProps {
  records: Record<string, DailyRecord>
  employees: Employee[]
}

interface EmployeeAnalytics {
  employeeId: number
  name: string
  center: string
  totalDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  totalLateMinutes: number
  totalDeductions: number
  averageArrivalTime: string
  punctualityScore: number
  attendanceRate: number
}

export function RecordAnalytics({ records, employees }: RecordAnalyticsProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })
  const [selectedCenter, setSelectedCenter] = useState<string>('all')
  const [selectedEmployee, setSelectedEmployee] = useState<number | 'all'>('all')

  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    Object.keys(records).forEach(date => {
      const monthKey = date.substring(0, 7)
      months.add(monthKey)
    })
    return Array.from(months).sort().reverse()
  }, [records])

  const centers = useMemo(() => {
    const centerSet = new Set<string>()
    employees.forEach(emp => centerSet.add(emp.center))
    return Array.from(centerSet)
  }, [employees])

  const employeeAnalytics = useMemo((): EmployeeAnalytics[] => {
    const analytics: Record<number, EmployeeAnalytics> = {}

    const filteredRecords = Object.entries(records).filter(([date]) => 
      date.startsWith(selectedMonth)
    )

    employees.forEach(emp => {
      if (selectedCenter !== 'all' && emp.center !== selectedCenter) return
      if (selectedEmployee !== 'all' && emp.id !== selectedEmployee) return

      analytics[emp.id] = {
        employeeId: emp.id,
        name: emp.name,
        center: emp.center,
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        totalLateMinutes: 0,
        totalDeductions: 0,
        averageArrivalTime: '',
        punctualityScore: 100,
        attendanceRate: 100
      }
    })

    filteredRecords.forEach(([_, record]) => {
      record.attendance?.forEach(att => {
        if (!analytics[att.employeeId]) return

        analytics[att.employeeId].totalDays++
        
        if (att.time) {
          analytics[att.employeeId].presentDays++
          if (att.delay && att.delay > 0) {
            analytics[att.employeeId].lateDays++
            analytics[att.employeeId].totalLateMinutes += att.delay
          }
        } else {
          analytics[att.employeeId].absentDays++
        }

        if (att.deduction) {
          analytics[att.employeeId].totalDeductions += att.deduction
        }
      })
    })

    return Object.values(analytics).map(emp => {
      const attendanceRate = emp.totalDays > 0 
        ? ((emp.presentDays / emp.totalDays) * 100).toFixed(1)
        : '100.0'
      
      const punctualityScore = emp.presentDays > 0
        ? Math.max(0, 100 - ((emp.lateDays / emp.presentDays) * 100)).toFixed(1)
        : '100.0'

      return {
        ...emp,
        attendanceRate: parseFloat(attendanceRate),
        punctualityScore: parseFloat(punctualityScore)
      }
    }).sort((a, b) => b.punctualityScore - a.punctualityScore)
  }, [records, employees, selectedMonth, selectedCenter, selectedEmployee])

  const monthlyTrends = useMemo(() => {
    const trends: Record<string, {
      date: string
      present: number
      late: number
      absent: number
      totalDeductions: number
    }> = {}

    const monthStart = parseISO(`${selectedMonth}-01`)
    const monthEnd = endOfMonth(monthStart)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      trends[dateStr] = {
        date: dateStr,
        present: 0,
        late: 0,
        absent: 0,
        totalDeductions: 0
      }
    })

    Object.entries(records).forEach(([date, record]) => {
      if (date.startsWith(selectedMonth) && trends[date]) {
        trends[date].present = record.stats.present || 0
        trends[date].late = record.stats.late || 0
        trends[date].absent = record.stats.absent || 0
        trends[date].totalDeductions = record.stats.totalDeductions || 0
      }
    })

    return Object.values(trends)
  }, [records, selectedMonth])

  const centerComparison = useMemo(() => {
    const comparison: Record<string, {
      center: string
      totalPresent: number
      totalLate: number
      totalAbsent: number
      totalDeductions: number
      averageAttendanceRate: number
    }> = {}

    centers.forEach(center => {
      comparison[center] = {
        center,
        totalPresent: 0,
        totalLate: 0,
        totalAbsent: 0,
        totalDeductions: 0,
        averageAttendanceRate: 100
      }
    })

    Object.entries(records).forEach(([date, record]) => {
      if (!date.startsWith(selectedMonth)) return

      Object.entries(record.centerStats || {}).forEach(([center, stats]) => {
        if (comparison[center]) {
          comparison[center].totalPresent += stats.present || 0
          comparison[center].totalLate += stats.late || 0
          comparison[center].totalDeductions += stats.deductions || 0
        }
      })
    })

    return Object.values(comparison)
  }, [records, selectedMonth, centers])

  const exportToCSV = () => {
    const headers = ['الموظف', 'المركز', 'أيام الحضور', 'أيام التأخير', 'أيام الغياب', 'إجمالي دقائق التأخير', 'إجمالي الخصومات', 'نسبة الحضور %', 'درجة الالتزام %']
    
    const rows = employeeAnalytics.map(emp => [
      emp.name,
      emp.center,
      emp.presentDays.toString(),
      emp.lateDays.toString(),
      emp.absentDays.toString(),
      emp.totalLateMinutes.toString(),
      emp.totalDeductions.toString(),
      emp.attendanceRate.toFixed(1),
      emp.punctualityScore.toFixed(1)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `تحليل_الحضور_${selectedMonth}.csv`
    link.click()
  }

  const exportMonthlyReport = () => {
    const reportLines: string[] = []
    reportLines.push('تقرير الحضور الشهري')
    reportLines.push(`الشهر: ${selectedMonth}`)
    reportLines.push('=' .repeat(80))
    reportLines.push('')
    
    reportLines.push('إحصائيات عامة:')
    const totalRecords = Object.keys(records).filter(d => d.startsWith(selectedMonth)).length
    reportLines.push(`عدد أيام العمل المسجلة: ${totalRecords}`)
    reportLines.push(`عدد الموظفين: ${employeeAnalytics.length}`)
    reportLines.push('')

    reportLines.push('أفضل 5 موظفين (حسب درجة الالتزام):')
    employeeAnalytics.slice(0, 5).forEach((emp, idx) => {
      reportLines.push(`${idx + 1}. ${emp.name} - ${emp.punctualityScore.toFixed(1)}%`)
    })
    reportLines.push('')

    reportLines.push('تفاصيل الموظفين:')
    reportLines.push('-'.repeat(80))
    employeeAnalytics.forEach(emp => {
      reportLines.push(`الاسم: ${emp.name}`)
      reportLines.push(`المركز: ${emp.center}`)
      reportLines.push(`أيام الحضور: ${emp.presentDays} | أيام التأخير: ${emp.lateDays} | أيام الغياب: ${emp.absentDays}`)
      reportLines.push(`إجمالي الخصومات: ${emp.totalDeductions} نقطة`)
      reportLines.push(`نسبة الحضور: ${emp.attendanceRate.toFixed(1)}% | درجة الالتزام: ${emp.punctualityScore.toFixed(1)}%`)
      reportLines.push('-'.repeat(80))
    })

    const blob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `تقرير_شهري_${selectedMonth}.txt`
    link.click()
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary flex items-center gap-2">
          <ChartBar size={32} weight="fill" />
          تحليلات السجلات
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download size={20} />
            تصدير CSV
          </Button>
          <Button onClick={exportMonthlyReport} variant="outline" className="gap-2">
            <FileText size={20} />
            تقرير شهري
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-bold mb-2 block">الشهر</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: ar })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-bold mb-2 block">المركز</label>
          <Select value={selectedCenter} onValueChange={setSelectedCenter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المراكز</SelectItem>
              {centers.map(center => (
                <SelectItem key={center} value={center}>{center}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-bold mb-2 block">الموظف</label>
          <Select 
            value={selectedEmployee === 'all' ? 'all' : selectedEmployee.toString()} 
            onValueChange={(val) => setSelectedEmployee(val === 'all' ? 'all' : parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الموظفين</SelectItem>
              {employees
                .filter(emp => selectedCenter === 'all' || emp.center === selectedCenter)
                .map(emp => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">تحليل الموظفين</TabsTrigger>
          <TabsTrigger value="trends">الاتجاهات الشهرية</TabsTrigger>
          <TabsTrigger value="centers">مقارنة المراكز</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users size={24} weight="fill" className="text-primary" />
              أداء الموظفين
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-right text-sm font-bold">#</th>
                    <th className="p-3 text-right text-sm font-bold">الموظف</th>
                    <th className="p-3 text-center text-sm font-bold">المركز</th>
                    <th className="p-3 text-center text-sm font-bold">الحضور</th>
                    <th className="p-3 text-center text-sm font-bold">التأخير</th>
                    <th className="p-3 text-center text-sm font-bold">الغياب</th>
                    <th className="p-3 text-center text-sm font-bold">دقائق التأخير</th>
                    <th className="p-3 text-center text-sm font-bold">الخصومات</th>
                    <th className="p-3 text-center text-sm font-bold">نسبة الحضور</th>
                    <th className="p-3 text-center text-sm font-bold">درجة الالتزام</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeAnalytics.map((emp, idx) => (
                    <tr key={emp.employeeId} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-center font-bold">{idx + 1}</td>
                      <td className="p-3 font-bold">{emp.name}</td>
                      <td className="p-3 text-center text-sm">{emp.center}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded-md bg-success/20 text-success font-bold">
                          {emp.presentDays}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded-md bg-warning/20 text-warning font-bold">
                          {emp.lateDays}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded-md bg-danger/20 text-danger font-bold">
                          {emp.absentDays}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-warning">
                        {emp.totalLateMinutes}
                      </td>
                      <td className="p-3 text-center font-bold text-destructive">
                        {emp.totalDeductions}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-success rounded-full"
                              style={{ width: `${emp.attendanceRate}%` }}
                            />
                          </div>
                          <span className="font-bold text-sm">{emp.attendanceRate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                emp.punctualityScore >= 90 ? 'bg-success' :
                                emp.punctualityScore >= 70 ? 'bg-warning' :
                                'bg-danger'
                              }`}
                              style={{ width: `${emp.punctualityScore}%` }}
                            />
                          </div>
                          <span className={`font-bold text-sm ${
                            emp.punctualityScore >= 90 ? 'text-success' :
                            emp.punctualityScore >= 70 ? 'text-warning' :
                            'text-danger'
                          }`}>
                            {emp.punctualityScore.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendUp size={24} weight="fill" className="text-primary" />
              الاتجاهات اليومية
            </h3>
            
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {monthlyTrends.map((trend, idx) => {
                const date = parseISO(trend.date)
                const dayName = format(date, 'EEEE', { locale: ar })
                const dayNumber = format(date, 'd')
                const isWeekendDay = isWeekend(date)
                
                return (
                  <div 
                    key={trend.date} 
                    className={`p-3 rounded-lg border ${isWeekendDay ? 'bg-muted/30' : 'bg-card'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold">
                        {dayName} {dayNumber}
                        {isWeekendDay && <span className="text-xs text-muted-foreground mr-2">(عطلة)</span>}
                      </div>
                      {trend.present > 0 && (
                        <div className="text-sm text-muted-foreground">
                          إجمالي: {trend.present + trend.late + trend.absent}
                        </div>
                      )}
                    </div>
                    
                    {trend.present > 0 || trend.late > 0 || trend.absent > 0 ? (
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="text-center p-2 rounded bg-success/10">
                          <div className="font-bold text-success">{trend.present}</div>
                          <div className="text-xs text-muted-foreground">حضور</div>
                        </div>
                        <div className="text-center p-2 rounded bg-warning/10">
                          <div className="font-bold text-warning">{trend.late}</div>
                          <div className="text-xs text-muted-foreground">تأخير</div>
                        </div>
                        <div className="text-center p-2 rounded bg-danger/10">
                          <div className="font-bold text-danger">{trend.absent}</div>
                          <div className="text-xs text-muted-foreground">غياب</div>
                        </div>
                        <div className="text-center p-2 rounded bg-destructive/10">
                          <div className="font-bold text-destructive">{trend.totalDeductions}</div>
                          <div className="text-xs text-muted-foreground">نقطة</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        لا توجد بيانات مسجلة
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="centers" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar size={24} weight="fill" className="text-primary" />
              مقارنة المراكز
            </h3>
            
            <div className="space-y-4">
              {centerComparison.map(center => {
                const total = center.totalPresent + center.totalLate + center.totalAbsent
                const attendanceRate = total > 0 ? ((center.totalPresent / total) * 100).toFixed(1) : '0'
                
                return (
                  <div key={center.center} className="p-4 rounded-lg border bg-card">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-lg">{center.center}</h4>
                      <div className="text-sm text-muted-foreground">
                        نسبة الحضور: <span className="font-bold text-success">{attendanceRate}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="text-center p-3 rounded-lg bg-success/10">
                        <div className="text-2xl font-bold text-success">{center.totalPresent}</div>
                        <div className="text-xs text-muted-foreground">حضور</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-warning/10">
                        <div className="text-2xl font-bold text-warning">{center.totalLate}</div>
                        <div className="text-xs text-muted-foreground">تأخير</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-danger/10">
                        <div className="text-2xl font-bold text-danger">{center.totalAbsent}</div>
                        <div className="text-xs text-muted-foreground">غياب</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-destructive/10">
                        <div className="text-2xl font-bold text-destructive">{center.totalDeductions}</div>
                        <div className="text-xs text-muted-foreground">نقطة</div>
                      </div>
                    </div>

                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full transition-all"
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
