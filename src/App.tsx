import { useState, useEffect, lazy, Suspense } from 'react'
import { useKV } from '@github/spark/hooks'
import { Employee, DailyRecord, Center, UserRole } from '@/lib/types'
import { CENTERS, centerOrder } from '@/lib/attendance'
import { defaultEmployees } from '@/lib/defaultData'
import { saveDailyRecord, getTodayDate } from '@/lib/recordsManager'
import { authenticateEmployee } from '@/lib/auth'
import { PortalSelector } from '@/components/PortalSelector'
import { LoginForm } from '@/components/LoginForm'
import { Header } from '@/components/Header'
import { Navigation } from '@/components/Navigation'
import { InstallPrompt } from '@/components/InstallPrompt'
import { NotificationManager } from '@/components/NotificationManager'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import type { DeductionRules } from '@/components/AdminSettingsView'
import { toast } from 'sonner'

// Lazy load heavy components
const AdminDashboard = lazy(() => import('@/components/AdminDashboard').then(m => ({ default: m.AdminDashboard })))
const EmployeeDashboard = lazy(() => import('@/components/EmployeeDashboard').then(m => ({ default: m.EmployeeDashboard })))
const DailyView = lazy(() => import('@/components/DailyView').then(m => ({ default: m.DailyView })))
const HistoryView = lazy(() => import('@/components/HistoryView').then(m => ({ default: m.HistoryView })))
const PayrollView = lazy(() => import('@/components/PayrollView').then(m => ({ default: m.PayrollView })))
const LeaveView = lazy(() => import('@/components/LeaveView').then(m => ({ default: m.LeaveView })))
const AdvancesManagementView = lazy(() => import('@/components/AdvancesManagementView').then(m => ({ default: m.AdvancesManagementView })))
const AdminSettingsView = lazy(() => import('@/components/AdminSettingsView').then(m => ({ default: m.AdminSettingsView })))
const AddUserView = lazy(() => import('@/components/AddUserView').then(m => ({ default: m.AddUserView })))
const AdminViewWrapper = lazy(() => import('@/components/AdminViewWrapper').then(m => ({ default: m.AdminViewWrapper })))
const AnonymousReportsView = lazy(() => import('@/components/AnonymousReportsView').then(m => ({ default: m.AnonymousReportsView })))
const NotificationManagementView = lazy(() => import('@/components/NotificationManagementView').then(m => ({ default: m.NotificationManagementView })))
const CenterComparisonView = lazy(() => import('@/components/CenterComparisonView').then(m => ({ default: m.CenterComparisonView })))
const RecordAnalytics = lazy(() => import('@/components/RecordAnalytics').then(m => ({ default: m.RecordAnalytics })))
const BackupManager = lazy(() => import('@/components/BackupManager').then(m => ({ default: m.BackupManager })))

type AppView = 'portal-selection' | 'login' | 'dashboard' | 'daily' | 'history' | 'payroll' | 'leave' | 'advances' | 'settings' | 'users' | 'reports' | 'notifications' | 'comparison' | 'analytics'

const DEFAULT_DEDUCTION_RULES: DeductionRules = {
  baseDeductionRules: {
    noDeduction: 30,
    level1: { minutes: 45, amount: 15 },
    level2: { minutes: 60, amount: 30 },
    level3: { minutes: 120, amount: 40 },
    maxDeduction: 45
  },
  employeeCustomRules: {}
}

function AppContent() {
  const { t, dir } = useLanguage()
  const [appView, setAppView] = useState<AppView>('portal-selection')
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null)
  const [currentUser, setCurrentUser] = useKV<Employee | null>('currentUser', null)
  const [loginError, setLoginError] = useState<string>('')
  const [currentView, setCurrentView] = useState<'daily' | 'history' | 'payroll' | 'leave' | 'advances'>('daily')
  
  const [employees, setEmployees] = useKV<Employee[]>(
    'employees',
    defaultEmployees.map((emp, idx) => ({ ...emp, id: idx + 1 }))
  )
  const [nextId, setNextId] = useKV<number>('nextId', defaultEmployees.length + 1)
  const [dailyRecords, setDailyRecords] = useKV<Record<string, DailyRecord>>('dailyRecords', {})
  const [deductionRules, setDeductionRules] = useKV<DeductionRules>('deductionRules', DEFAULT_DEDUCTION_RULES)

  const validateAndFixEmployees = (emps: Employee[] | undefined): Employee[] => {
    if (!Array.isArray(emps)) {
      return defaultEmployees.map((emp, idx) => ({ ...emp, id: idx + 1 }))
    }
    
    return emps.map((emp, idx) => {
      if (!emp.username) {
        return {
          ...emp,
          username: emp.username || `user${emp.id || idx + 1}`,
          role: emp.role || 'employee'
        }
      }
      return emp
    })
  }

  const safeEmployees = validateAndFixEmployees(employees)

  useEffect(() => {
    if (currentUser) {
      const userStillExists = safeEmployees.find(emp => emp.id === currentUser.id)
      
      if (userStillExists) {
        setAppView('dashboard')
        setSelectedPortal(currentUser.role)
      } else {
        setCurrentUser(null)
        setAppView('portal-selection')
        toast.error(t.auth.userNoLongerExists)
      }
    }
  }, [])

  const handleResetData = () => {
    setEmployees(defaultEmployees.map((emp, idx) => ({ ...emp, id: idx + 1 })))
    setNextId(defaultEmployees.length + 1)
    setDailyRecords({})
    setDeductionRules(DEFAULT_DEDUCTION_RULES)
    toast.success(t.actions.dataResetSuccess)
  }

  const handleClearAllData = async () => {
    try {
      const keysToDelete = [
        'dailyRecords',
        'employeeAdvances',
        'employeeLeaveRequests',
        'anonymousReports',
        'locationHistory',
        'notifications',
        'readNotifications',
        'advances',
        'bonuses',
        'customDeductions',
        'leaveRequests'
      ]
      
      for (const key of keysToDelete) {
        await window.spark.kv.delete(key)
      }
      
      setDailyRecords({})
      
      setEmployees((current) => 
        (Array.isArray(current) ? current : []).map(emp => ({
          ...emp,
          totalAdvances: 0,
          totalBonuses: 0,
          totalDeductions: 0
        }))
      )
      
      toast.success('تم مسح جميع البيانات بنجاح! تم الاحتفاظ بإعدادات النظام والموظفين والسياج الجغرافي.')
    } catch (error) {
      toast.error('حدث خطأ أثناء مسح البيانات')
    }
  }

  const handlePortalSelection = (role: UserRole) => {
    setSelectedPortal(role)
    setAppView('login')
    setLoginError('')
  }

  const handleLogin = (username: string, password: string) => {
    const employee = authenticateEmployee(username, password, safeEmployees)
    
    if (!employee) {
      setLoginError(t.auth.invalidCredentials)
      return
    }
    
    if (employee.role !== selectedPortal) {
      setLoginError(t.auth.noPermission)
      return
    }
    
    setCurrentUser(employee)
    setLoginError('')
    setAppView('dashboard')
    
    toast.success(`${t.auth.welcome} ${employee.name}`)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setSelectedPortal(null)
    setAppView('portal-selection')
    setCurrentView('daily')
    toast.success(t.actions.logoutSuccess)
  }

  const handleAdminNavigate = (view: string) => {
    if (view === 'daily' || view === 'history' || view === 'payroll' || view === 'leave' || view === 'advances') {
      setCurrentView(view)
      setAppView(view as AppView)
    } else if (view === 'settings') {
      setAppView('settings')
    } else if (view === 'users') {
      setAppView('users')
    } else if (view === 'reports') {
      setAppView('reports')
    } else if (view === 'notifications') {
      setAppView('notifications')
    } else if (view === 'comparison') {
      setAppView('comparison')
    } else if (view === 'analytics') {
      setAppView('analytics')
    }
  }

  const handleUpdateEmployee = (employeeId: number, updates: Partial<Employee>) => {
    setEmployees((current) =>
      (Array.isArray(current) ? current : []).map(emp =>
        emp.id === employeeId ? { ...emp, ...updates } : emp
      )
    )
  }

  const handleAddEmployee = (newEmployeeData: Omit<Employee, 'id'>) => {
    const newEmployee: Employee = {
      ...newEmployeeData,
      id: (nextId || 1)
    }
    setNextId((nextId || 1) + 1)
    setEmployees((current) => [...(Array.isArray(current) ? current : []), newEmployee])
  }

  const handleUpdateDeductionRules = (rules: DeductionRules) => {
    setDeductionRules(rules)
  }

  const handleUpdateRecord = (date: string, updatedRecord: DailyRecord) => {
    setDailyRecords((current) => ({
      ...(current || {}),
      [date]: updatedRecord
    }))
  }

  const handleDeleteRecord = (date: string) => {
    setDailyRecords((current) => {
      const updated = { ...(current || {}) }
      delete updated[date]
      return updated
    })
  }

  const sortEmployees = (emps: Employee[]) => {
    return [...emps].sort((a, b) => {
      const centerDiff = centerOrder.indexOf(a.center) - centerOrder.indexOf(b.center)
      if (centerDiff !== 0) return centerDiff
      return a.name.localeCompare(b.name, 'ar')
    })
  }

  const updateName = (id: number, name: string) => {
    setEmployees((current) => 
      (Array.isArray(current) ? current : []).map(emp => emp.id === id ? { ...emp, name } : emp)
    )
  }

  const updateTime = (id: number, time: string) => {
    setEmployees((current) => 
      (Array.isArray(current) ? current : []).map(emp => emp.id === id ? { ...emp, time } : emp)
    )
  }

  const updateCenter = (id: number, center: string) => {
    setEmployees((current) => {
      const updated = (Array.isArray(current) ? current : []).map(emp => 
        emp.id === id ? { ...emp, center: center as Center } : emp
      )
      return sortEmployees(updated)
    })
  }

  const deleteEmployee = (id: number) => {
    setEmployees((current) => (Array.isArray(current) ? current : []).filter(emp => emp.id !== id))
    toast.success(t.centers.delete)
  }

  const addEmployee = () => {
    const newEmp: Employee = {
      id: nextId || 1,
      name: "موظف جديد",
      center: CENTERS.MAIN,
      time: "",
      salary: 3500,
      position: "موظف",
      username: `user${nextId || 1}`,
      role: "employee"
    }
    
    setNextId((nextId || 1) + 1)
    setEmployees((current) => sortEmployees([...(Array.isArray(current) ? current : []), newEmp]))
    toast.success(t.employee.addEmployee)
  }

  const resetTimes = () => {
    setEmployees((current) =>
      (Array.isArray(current) ? current : []).map(emp => ({ ...emp, time: "" }))
    )
    toast.success(t.actions.reset)
  }

  const setAllTimesTo8AM = () => {
    setEmployees((current) =>
      (Array.isArray(current) ? current : []).map(emp => ({ ...emp, time: "08:00" }))
    )
    toast.success("تم تعيين جميع المواعيد إلى 8 صباحاً")
  }

  const setAllTimesToCustom = (time: string) => {
    setEmployees((current) =>
      (Array.isArray(current) ? current : []).map(emp => ({ ...emp, time }))
    )
    const timeLabels: Record<string, string> = {
      "08:00": "8 صباحاً",
      "09:00": "9 صباحاً",
      "10:00": "10 صباحاً",
      "11:00": "11 صباحاً",
      "12:00": "12 ظهراً"
    }
    toast.success(`تم تعيين جميع المواعيد إلى ${timeLabels[time] || time}`)
  }

  const saveTodayRecord = () => {
    const todayDate = getTodayDate()
    const record = saveDailyRecord(safeEmployees)
    
    setDailyRecords((current) => ({
      ...(current || {}),
      [todayDate]: record
    }))
    
    toast.success(`${t.centers.save} ${todayDate}`)
  }

  if (appView === 'portal-selection') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-5" dir={dir}>
        <PortalSelector onSelectPortal={handlePortalSelection} />
      </div>
    )
  }

  if (appView === 'login' && selectedPortal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-5" dir={dir}>
        <div className="w-full max-w-md">
          <button
            onClick={() => {
              setAppView('portal-selection')
              setSelectedPortal(null)
              setLoginError('')
            }}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            {dir === 'rtl' ? '← ' : '→ '}{t.auth.backToSelection}
          </button>
          <LoginForm 
            role={selectedPortal}
            onLogin={handleLogin}
            error={loginError}
          />
        </div>
      </div>
    )
  }

  if (appView === 'dashboard' && currentUser) {
    if (currentUser.role === 'admin') {
      return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <AdminDashboard user={currentUser} onLogout={handleLogout} onNavigate={handleAdminNavigate} onResetData={handleResetData} onClearAllData={handleClearAllData} />
        </Suspense>
      )
    }
    if (currentUser.role === 'employee') {
      return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <EmployeeDashboard user={currentUser} onLogout={handleLogout} />
        </Suspense>
      )
    }
  }

  if (currentUser && currentUser.role === 'admin' && appView === 'users') {
    return (
      <AdminViewWrapper>
        <div dir={dir}>
          <AddUserView
            employees={safeEmployees}
            onAddEmployee={handleAddEmployee}
            onBack={() => setAppView('dashboard')}
          />
        </div>
      </AdminViewWrapper>
    )
  }

  if (currentUser && currentUser.role === 'admin' && (appView === 'daily' || appView === 'history' || appView === 'payroll' || appView === 'leave' || appView === 'advances' || appView === 'settings' || appView === 'reports' || appView === 'notifications' || appView === 'comparison' || appView === 'analytics')) {
    if (appView === 'analytics') {
      return (
        <AdminViewWrapper>
          <div className="min-h-screen bg-background p-3 md:p-5 pb-20 md:pb-5" dir={dir}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setAppView('dashboard')}
                  className="text-muted-foreground hover:text-foreground min-h-[44px] px-3"
                >
                  {dir === 'rtl' ? '← ' : '→ '}{t.dashboard.backToDashboard}
                </button>
              </div>

              <div className="space-y-6">
                <RecordAnalytics 
                  records={dailyRecords || {}}
                  employees={safeEmployees}
                />
                
                <BackupManager />
              </div>
            </div>
          </div>
        </AdminViewWrapper>
      )
    }
    
    if (appView === 'comparison') {
      return (
        <AdminViewWrapper>
          <CenterComparisonView 
            employees={safeEmployees}
            records={dailyRecords || {}}
            onBack={() => setAppView('dashboard')}
          />
        </AdminViewWrapper>
      )
    }

    if (appView === 'reports') {
      return (
        <AdminViewWrapper>
          <div className="min-h-screen bg-background p-3 md:p-5 pb-20 md:pb-5" dir={dir}>
            <div className="max-w-7xl mx-auto">
              <AnonymousReportsView currentUser={currentUser} onBack={() => setAppView('dashboard')} />
            </div>
          </div>
        </AdminViewWrapper>
      )
    }

    if (appView === 'notifications') {
      return (
        <AdminViewWrapper>
          <div className="min-h-screen bg-background p-3 md:p-5 pb-20 md:pb-5" dir={dir}>
            <div className="max-w-7xl mx-auto">
              <NotificationManagementView 
                employees={safeEmployees}
                currentUserName={currentUser.name}
                onBack={() => setAppView('dashboard')}
              />
            </div>
          </div>
        </AdminViewWrapper>
      )
    }
    
    if (appView === 'settings') {
      return (
        <AdminViewWrapper>
          <div className="min-h-screen bg-background p-3 md:p-5 pb-20 md:pb-5" dir={dir}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setAppView('dashboard')}
                  className="text-muted-foreground hover:text-foreground min-h-[44px] px-3"
                >
                  {dir === 'rtl' ? '← ' : '→ '}{t.dashboard.backToDashboard}
                </button>
              </div>

              <AdminSettingsView
                currentUser={currentUser}
                employees={safeEmployees}
                onUpdateEmployee={handleUpdateEmployee}
                onUpdateDeductionRules={handleUpdateDeductionRules}
                deductionRules={deductionRules || DEFAULT_DEDUCTION_RULES}
              />
            </div>
          </div>
        </AdminViewWrapper>
      )
    }
    
    return (
      <AdminViewWrapper>
        <div className="min-h-screen bg-background p-3 md:p-5 pb-20 md:pb-5" dir={dir}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setAppView('dashboard')}
                className="text-muted-foreground hover:text-foreground min-h-[44px] px-3"
              >
                {dir === 'rtl' ? '← ' : '→ '}{t.dashboard.backToDashboard}
              </button>
            </div>
            
            <Header />
            <Navigation currentView={currentView} onViewChange={setCurrentView} />

            {currentView === 'daily' && (
              <DailyView
                employees={safeEmployees}
                onUpdateName={updateName}
                onUpdateTime={updateTime}
                onUpdateCenter={updateCenter}
                onDelete={deleteEmployee}
                onAddEmployee={addEmployee}
                onResetTimes={resetTimes}
                onSetAllTimesTo8AM={setAllTimesTo8AM}
                onSetAllTimesToCustom={setAllTimesToCustom}
                onSaveToday={saveTodayRecord}
                onUpdateEmployee={handleUpdateEmployee}
              />
            )}

            {currentView === 'history' && (
              <HistoryView 
                records={dailyRecords || {}} 
                onUpdateRecord={handleUpdateRecord}
                onDeleteRecord={handleDeleteRecord}
              />
            )}

            {currentView === 'payroll' && (
              <PayrollView 
                employees={safeEmployees} 
                records={dailyRecords || {}} 
                onUpdateEmployee={handleUpdateEmployee}
              />
            )}

            {currentView === 'leave' && (
              <LeaveView employees={safeEmployees} />
            )}

            {currentView === 'advances' && (
              <AdvancesManagementView employees={safeEmployees} />
            )}
          </div>
        </div>
      </AdminViewWrapper>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5" dir={dir}>
      <PortalSelector onSelectPortal={handlePortalSelection} />
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <NotificationManager />
      <AppContent />
      <InstallPrompt />
    </LanguageProvider>
  )
}

export default App