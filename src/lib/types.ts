export type Center = "صرح الاتقان الامريكي 1" | "صرح الاتقان الاوربي 2" | "صرح الاتقان الرئيسي"

export type AttendanceStatus = "حضور" | "تأخير" | "غياب" | "إجازة"

export type LeaveType = "سنوية" | "مرضية" | "طارئة" | "بدون راتب" | "إجازة سنوية" | "إجازة مرضية" | "إجازة طارئة" | "إجازة بدون راتب"

export type UserRole = 'admin' | 'employee'

export type ShiftType = 'صباحي' | 'مسائي'

export interface Employee {
  id: number
  name: string
  center: Center
  time: string
  salary: number
  position: string
  nameUrdu?: string
  hireDate?: string
  phoneNumber?: string
  username: string
  role: UserRole
  shift?: ShiftType
  profileImage?: string
  totalAdvances?: number
  totalBonuses?: number
  totalDeductions?: number
}

export interface AttendanceRecord {
  employeeId: number
  name: string
  center: Center | undefined
  time: string
  status: AttendanceStatus
  lateMinutes: number | undefined
  deduction: number | undefined
}

export interface DailyRecord {
  date: string
  employees?: AttendanceRecord[]
  attendance?: DailyAttendance[]
  records?: DailyRecordRow[]
  stats: {
    total: number
    totalEmployees?: number
    present: number
    late: number
    absent?: number
    totalDeductions: number
  }
  centerStats: Record<Center, CenterStats>
}

export interface DailyAttendance {
  employeeId: number
  name: string
  center?: Center
  status: AttendanceStatus | "مبكر" | "تأخير شديد"
  time: string
  lateMinutes?: number
  delay?: number
  deduction?: number
}

export interface LeaveRequest {
  id: string
  employeeId: number
  employeeName: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  days: number
  status: "قيد المراجعة" | "موافق عليها" | "مرفوضة" | "معلق" | "موافق عليه" | "مرفوض"
  reason: string
  requestDate?: string
  approvedBy?: string
  approvalDate?: string
  salary?: number
}

export interface AttendanceCalculation {
  delay: number
  deduction: number
  lateMinutes: number
  status: AttendanceStatus | "مبكر" | "تأخير شديد"
  style: string
}

export interface EmployeePayroll {
  employeeId: number
  name: string
  center: Center
  salary: number
  totalDeductions: number
  daysPresent: number
  daysAbsent: number
  advanceDeductions: number
  bonuses: number
  netSalary: number
}

export interface AdvancePayment {
  id: string
  employeeId: number
  employeeName: string
  amount: number
  date: string
  monthlyInstallment: number
  remainingInstallments: number
  totalInstallments: number
  status: "نشط" | "مكتمل"
}

export interface Bonus {
  id: string
  employeeId: number
  employeeName: string
  amount: number
  date: string
  reason: string
  approvalDate?: string
  approvedBy?: string
  status?: "معلق" | "موافق عليه" | "مرفوض"
  type?: "مكافأة" | "حافز"
}

export interface CustomDeduction {
  id: string
  employeeId: number
  employeeName: string
  amount: number
  date: string
  reason: string
  type: "خصم ثابت" | "خصم شهري"
  status: "نشط" | "متوقف" | "مكتمل"
  isRecurring?: boolean
}

export interface Advance {
  id: string
  employeeId: number
  employeeName: string
  amount: number
  date: string
  startDate?: string
  reason?: string
  status: "معلق" | "موافق عليه" | "مرفوض"
  monthlyDeduction?: number
  monthlyInstallment?: number
  remainingInstallments: number
  totalInstallments?: number
  installments?: number
  approvedBy?: string
  approvalDate?: string
}

export interface MonthlyDeduction {
  employeeId: number
  name?: string
  deduction?: number
  totalDeductions: number
  reason?: string
  daysLate: number
  totalMinutesLate: number
}

export interface DailyRecordRow {
  name: string
  time: string
  deduction: number | undefined
}

export interface CenterStats {
  total: number
  late: number
  minutes: number
  deductions: number
  present?: number
  attendance?: number
}

export interface MonthlyStats {
  totalDeductions: number
  totalMinutesLate: number
  daysPresent: number
  daysLate: number
}

export interface AttendanceButtonSettings {
  checkInStartTime: string
  checkInEndTime: string
  checkOutStartTime: string
  checkOutEndTime: string
  enabled: boolean
}

export interface EmployeeAttendanceRecord {
  id: string
  employeeId: number
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: 'checked-in' | 'checked-out'
  lateMinutes?: number
  checkInLocation?: GeolocationCoordinates
  checkOutLocation?: GeolocationCoordinates
}

export interface GeolocationCoordinates {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp?: number
}

export interface GeofenceSettings {
  enabled: boolean
  centerLatitude: number
  centerLongitude: number
  radiusInMeters: number
  allowedCenters: {
    [key: string]: {
      name: string
      latitude: number
      longitude: number
      radius: number
    }
  }
  polygonPoints?: Array<{ lat: number; lng: number }>
}

export type ViolationType = 'سلوك غير لائق' | 'إهمال في العمل' | 'تأخر متكرر' | 'غياب بدون إذن' | 'سوء معاملة' | 'مخالفة أمنية' | 'أخرى'

export interface AnonymousReport {
  id: string
  timestamp: string
  center: Center
  violationType: ViolationType
  description: string
  mediaFiles?: ReportMedia[]
  status: 'جديد' | 'قيد المراجعة' | 'تم الحل' | 'مرفوض'
  adminNotes?: string
  resolvedDate?: string
  resolvedBy?: string
}

export interface ReportMedia {
  id: string
  type: 'image' | 'video'
  dataUrl: string
  timestamp: number
  size?: number
}

export type NotificationPriority = 'urgent' | 'meeting' | 'attention'
export type NotificationTargetType = 'all' | 'center' | 'specific'

export interface Notification {
  id: string
  title: string
  message: string
  priority: NotificationPriority
  targetType: NotificationTargetType
  targetCenter?: Center
  targetEmployeeIds?: number[]
  createdBy: string
  createdAt: string
  readBy: number[]
  dismissedBy: number[]
}
