import { DailyRecord, DailyAttendance, Employee, CenterStats, Center, MonthlyDeduction, AttendanceRecord, AttendanceStatus } from './types'
import { calculateStats, CENTERS } from './attendance'

export function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export function getMonthKey(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

export function saveDailyRecord(employees: Employee[]): DailyRecord {
  const date = getTodayDate()
  
  const attendance: DailyAttendance[] = employees.map(emp => {
    const calc = calculateStats(emp.time)
    return {
      employeeId: emp.id,
      name: emp.name,
      center: emp.center,
      time: emp.time,
      delay: calc.delay,
      deduction: calc.deduction,
      status: calc.status
    }
  })

  const stats = attendance.reduce(
    (acc, att) => {
      acc.total++
      acc.totalEmployees++
      if ((att.deduction || 0) > 0) {
        acc.late++
      } else if (att.time) {
        acc.present++
      } else {
        acc.absent++
      }
      acc.totalDeductions += att.deduction || 0
      return acc
    },
    { total: 0, totalEmployees: 0, present: 0, late: 0, absent: 0, totalDeductions: 0 }
  )

  const centerStats = attendance.reduce(
    (acc, att) => {
      const center = (att.center || CENTERS.MAIN) as Center
      if (!acc[center]) {
        acc[center] = { total: 0, late: 0, minutes: 0, deductions: 0, present: 0 }
      }
      acc[center]!.total++
      if ((att.deduction || 0) > 0) {
        acc[center]!.late++
      } else if (att.time) {
        acc[center]!.present = (acc[center]!.present || 0) + 1
      }
      acc[center]!.minutes += att.delay || 0
      acc[center]!.deductions += att.deduction || 0
      return acc
    },
    {} as Record<Center, CenterStats>
  )

  const records: AttendanceRecord[] = attendance.map(att => ({
    employeeId: att.employeeId,
    name: att.name,
    center: att.center,
    time: att.time,
    status: att.status as AttendanceStatus,
    lateMinutes: att.delay,
    deduction: att.deduction
  }))

  return {
    date,
    records,
    attendance,
    stats,
    centerStats
  }
}

export function calculateMonthlyDeductions(records: Record<string, DailyRecord>): Record<number, MonthlyDeduction> {
  const monthKey = getMonthKey()
  const deductions: Record<number, MonthlyDeduction> = {}

  Object.entries(records).forEach(([date, record]) => {
    if (date.startsWith(monthKey)) {
      const attendanceList = record.attendance || []
      attendanceList.forEach(att => {
        if (!deductions[att.employeeId]) {
          deductions[att.employeeId] = {
            employeeId: att.employeeId,
            totalDeductions: 0,
            daysLate: 0,
            totalMinutesLate: 0
          }
        }
        
        deductions[att.employeeId].totalDeductions += att.deduction || 0
        if ((att.deduction || 0) > 0) {
          deductions[att.employeeId].daysLate++
        }
        deductions[att.employeeId].totalMinutesLate += att.delay || 0
      })
    }
  })

  return deductions
}

export function getDateRange(days: number = 30): string[] {
  const dates: string[] = []
  const today = new Date()
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.unshift(date.toISOString().split('T')[0])
  }
  
  return dates
}

export async function autoSaveDailyRecord(employees: Employee[]): Promise<void> {
  try {
    const todayDate = getTodayDate()
    const existingRecords = await window.spark.kv.get('dailyRecords') as Record<string, DailyRecord> || {}
    
    if (existingRecords[todayDate]) {
      return
    }

    const record = saveDailyRecord(employees)
    existingRecords[todayDate] = record
    
    await window.spark.kv.set('dailyRecords', existingRecords)
  } catch (error) {
    console.error('Auto-save error:', error)
  }
}

export function exportRecordsToJSON(records: Record<string, DailyRecord>): string {
  return JSON.stringify(records, null, 2)
}

export function importRecordsFromJSON(jsonString: string): Record<string, DailyRecord> {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    throw new Error('Invalid JSON format')
  }
}
