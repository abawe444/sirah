import { useLocalDatabase } from '@/hooks/useLocalDatabase'

// ============ Users (Employees + System Users) ============
export interface User {
  id: number
  name: string
  nameHindi?: string
  username: string
  password: string
  email: string
  position: string
  center: string
  salary: number
  time: string
  role: 'admin' | 'employee'
  totalAdvances: number
  totalBonuses: number
  totalDeductions: number
  profileImage: string
  fullName: string
  employeeId: number
  isActive: boolean
  joinDate: string
}

export interface UsersData {
  users: User[]
  nextId: number
}

export function useUsers() {
  return useLocalDatabase<UsersData>({
    filename: 'users.json',
    defaultData: { users: [], nextId: 1 }
  })
}

// ============ Add Employee ============
export function useAddEmployee() {
  const { data, saveData } = useUsers()
  
  return (newEmployee: Partial<User>) => {
    if (!data) return
    
    const employee: User = {
      ...newEmployee,
      id: data.nextId,
      fullName: newEmployee.name || '',
      employeeId: data.nextId,
      isActive: true,
      joinDate: new Date().toISOString().split('T')[0]
    } as User
    
    const updated = {
      users: [...data.users, employee],
      nextId: data.nextId + 1
    }
    saveData(updated)
    return employee
  }
}

// ============ Update Employee ============
export function useUpdateEmployee() {
  const { data, saveData } = useUsers()
  
  return (id: number, updates: Partial<User>) => {
    if (!data) return
    
    const updated = {
      ...data,
      users: data.users.map((u: User) => 
        u.id === id ? { ...u, ...updates } : u
      )
    }
    saveData(updated)
  }
}

// ============ Delete Employee ============
export function useDeleteEmployee() {
  const { data, saveData } = useUsers()
  
  return (id: number) => {
    if (!data) return
    
    const updated = {
      ...data,
      users: data.users.filter((u: User) => u.id !== id)
    }
    saveData(updated)
  }
}

// ============ Get Employee by ID ============
export function useGetEmployee(id: number) {
  const { data } = useUsers()
  return data?.users.find((u: User) => u.id === id) || null
}

// ============ Authenticate User ============
export function useAuthenticate() {
  const { data } = useUsers()
  
  return (username: string, password: string) => {
    if (!data) return null
    
    const user = data.users.find(
      (u: User) => u.username === username && u.password === password
    )
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
    
    return user || null
  }
}

// ============ Get Current User ============
export function useCurrentUser() {
  const currentUserStr = localStorage.getItem('currentUser')
  return currentUserStr ? JSON.parse(currentUserStr) as User : null
}

// ============ Logout ============
export function useLogout() {
  return () => {
    localStorage.removeItem('currentUser')
  }
}

// ============ Attendance Records ============
export interface AttendanceRecord {
  id: number
  employeeId: number
  date: string
  checkIn: string
  checkOut: string
  status: string
  location: string
  latitude?: number
  longitude?: number
}

export interface AttendanceData {
  records: AttendanceRecord[]
}

export function useAttendance() {
  return useLocalDatabase<AttendanceData>({
    filename: 'attendance.json',
    defaultData: { records: [] }
  })
}

// ============ Leave Requests ============
export interface LeaveRequest {
  id: number
  employeeId: number
  startDate: string
  endDate: string
  type: string
  status: string
}

export interface LeaveRequestsData {
  requests: LeaveRequest[]
}

export function useLeaveRequests() {
  return useLocalDatabase<LeaveRequestsData>({
    filename: 'leaveRequests.json',
    defaultData: { requests: [] }
  })
}

// ============ Advances ============
export interface Advance {
  id: number
  employeeId: number
  amount: number
  date: string
  status: string
}

export interface AdvancesData {
  advances: Advance[]
}

export function useAdvances() {
  return useLocalDatabase<AdvancesData>({
    filename: 'advances.json',
    defaultData: { advances: [] }
  })
}

// ============ Bonuses ============
export interface Bonus {
  id: number
  employeeId: number
  amount: number
  reason: string
  date: string
}

export interface BonusesData {
  bonuses: Bonus[]
}

export function useBonuses() {
  return useLocalDatabase<BonusesData>({
    filename: 'bonuses.json',
    defaultData: { bonuses: [] }
  })
}

// ============ Deduction Rules ============
export interface DeductionRules {
  rules: {
    latenessPenalty: number
    absencePenalty: number
    earlyLeaveDeduction: number
  }
}

export function useDeductionRules() {
  return useLocalDatabase<DeductionRules>({
    filename: 'deductionRules.json',
    defaultData: { rules: { latenessPenalty: 0, absencePenalty: 0, earlyLeaveDeduction: 0 } }
  })
}

// ============ Attendance Button Settings ============
export interface AttendanceSettings {
  settings: {
    enableGeofence: boolean
    geofenceRadius: number
    allowManualEntry: boolean
    requirePhoto: boolean
    enableNotifications: boolean
  }
}

export function useAttendanceSettings() {
  return useLocalDatabase<AttendanceSettings>({
    filename: 'attendance-button-settings.json',
    defaultData: { settings: { enableGeofence: true, geofenceRadius: 500, allowManualEntry: false, requirePhoto: true, enableNotifications: true } }
  })
}

// ============ Geofence Settings ============
export interface GeofenceZone {
  id: number
  name: string
  latitude: number
  longitude: number
  radius: number
}

export interface GeofenceSettings {
  zones: GeofenceZone[]
}

export function useGeofenceSettings() {
  return useLocalDatabase<GeofenceSettings>({
    filename: 'geofence-settings.json',
    defaultData: { zones: [] }
  })
}

// ============ Notifications ============
export interface Notification {
  id: number
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  targetType: string
  timestamp?: string
}

export interface NotificationsData {
  notifications: Notification[]
}

export function useNotifications() {
  return useLocalDatabase<NotificationsData>({
    filename: 'notifications.json',
    defaultData: { notifications: [] }
  })
}

// ============ Config ============
export interface ConfigData {
  appLanguage: string
  dailyRecords: Record<string, unknown>
  anonymousReports: unknown[]
  currentUser: User | null
}

export function useConfig() {
  return useLocalDatabase<ConfigData>({
    filename: 'config.json',
    defaultData: { appLanguage: 'ar', dailyRecords: {}, anonymousReports: [], currentUser: null }
  })
}
