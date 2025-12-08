import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, CurrencyDollar, CalendarBlank, TrendUp, Power, SignIn, SignOut, MapPin, ShieldWarning, Trophy, Medal, Users, User, Eye, EyeSlash } from '@phosphor-icons/react'
import { Employee, AttendanceButtonSettings, EmployeeAttendanceRecord, GeofenceSettings, GeolocationCoordinates, DailyRecord, Center } from '@/lib/types'
import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator'
import { GeofenceMap } from '@/components/GeofenceMap'
import { LocationHistoryView } from '@/components/LocationHistoryView'
import { AnonymousReportForm } from '@/components/AnonymousReportForm'
import { EmployeeProfileView } from '@/components/EmployeeProfileView'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGeofenceNotifications } from '@/hooks/use-geofence-notifications'
import { CENTERS } from '@/lib/attendance'
import { Badge } from '@/components/ui/badge'

interface EmployeeDashboardProps {
  user: Employee
  onLogout: () => void
}

export function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const { t, dir } = useLanguage()
  const [buttonSettings] = useKV<AttendanceButtonSettings>('attendance-button-settings', {
    checkInStartTime: '06:00',
    checkInEndTime: '10:00',
    checkOutStartTime: '14:00',
    checkOutEndTime: '23:59',
    enabled: true
  })

  const [geofenceSettings] = useKV<GeofenceSettings>('geofence-settings', {
    enabled: false,
    centerLatitude: 21.3891,
    centerLongitude: 39.8579,
    radiusInMeters: 200,
    allowedCenters: {
      'us': { name: 'المركز الأمريكي', latitude: 21.3891, longitude: 39.8579, radius: 200 },
      'eu': { name: 'المركز الأوروبي', latitude: 21.3920, longitude: 39.8600, radius: 200 },
      'main': { name: 'المركز الرئيسي', latitude: 21.3850, longitude: 39.8550, radius: 200 }
    }
  })

  const [attendanceRecords, setAttendanceRecords] = useKV<EmployeeAttendanceRecord[]>('employee-attendance-records', [])
  const [dailyRecords] = useKV<Record<string, DailyRecord>>('dailyRecords', {})
  const [employees] = useKV<Employee[]>('employees', [])
  const [advances] = useKV<any[]>('advances', [])
  const [bonuses] = useKV<any[]>('bonuses', [])
  const [customDeductions] = useKV<any[]>('customDeductions', [])
  const [leaveRequests] = useKV<any[]>('leaveRequests', [])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null)
  const [isInsideGeofence, setIsInsideGeofence] = useState(false)
  const [showAttendanceSection, setShowAttendanceSection] = useKV<boolean>('employee-show-attendance', true)

  const getUserCenter = () => {
    const centerMap: { [key: string]: string } = {
      'صرح الاتقان الامريكي 1': 'us',
      'صرح الاتقان الاوربي 2': 'eu',
      'صرح الاتقان الرئيسي': 'main'
    }
    return centerMap[user.center] || 'main'
  }

  const { isInsideGeofence: geofenceStatus } = useGeofenceNotifications({
    settings: geofenceSettings || {
      enabled: false,
      centerLatitude: 21.3891,
      centerLongitude: 39.8579,
      radiusInMeters: 200,
      allowedCenters: {}
    },
    userCenter: getUserCenter(),
    enabled: geofenceSettings?.enabled || false
  })

  useEffect(() => {
    setIsInsideGeofence(geofenceStatus)
  }, [geofenceStatus])

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 800))
    setCurrentTime(new Date())
    toast.success(t('messages.dataRefreshed') || 'تم تحديث البيانات')
  }

  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    enabled: true
  })

  const isTriggered = pullDistance >= 80

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getTodayRecord = () => {
    const today = new Date().toISOString().split('T')[0]
    return attendanceRecords?.find(
      r => r.employeeId === user.id && r.date === today
    )
  }

  const isTimeInRange = (startTime: string, endTime: string) => {
    const now = currentTime
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const start = new Date(now)
    start.setHours(startHour, startMin, 0, 0)
    
    const end = new Date(now)
    end.setHours(endHour, endMin, 59, 999)
    
    return now >= start && now <= end
  }

  const canCheckIn = () => {
    if (!buttonSettings?.enabled) return false
    if (geofenceSettings?.enabled && !isInsideGeofence) return false
    const todayRecord = getTodayRecord()
    if (todayRecord?.checkInTime) return false
    return isTimeInRange(buttonSettings.checkInStartTime, buttonSettings.checkInEndTime)
  }

  const canCheckOut = () => {
    if (!buttonSettings?.enabled) return false
    if (geofenceSettings?.enabled && !isInsideGeofence) return false
    const todayRecord = getTodayRecord()
    if (!todayRecord?.checkInTime || todayRecord?.checkOutTime) return false
    return isTimeInRange(buttonSettings.checkOutStartTime, buttonSettings.checkOutEndTime)
  }

  const handleLocationUpdate = (coords: GeolocationCoordinates, inside: boolean) => {
    setCurrentLocation(coords)
    setIsInsideGeofence(inside)
  }

  const handleCheckIn = async () => {
    if (geofenceSettings?.enabled && !currentLocation) {
      toast.error('الرجاء السماح بالوصول للموقع لتسجيل الحضور')
      return
    }

    if (geofenceSettings?.enabled && !isInsideGeofence) {
      toast.error('لا يمكنك تسجيل الحضور - أنت خارج منطقة العمل المسموحة')
      return
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const timeString = now.toTimeString().split(' ')[0].substring(0, 5)
    
    const locationData = currentLocation ? {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy: currentLocation.accuracy,
      timestamp: Date.now()
    } : undefined

    const newRecord: EmployeeAttendanceRecord = {
      id: `${user.id}-${today}`,
      employeeId: user.id,
      date: today,
      checkInTime: timeString,
      status: 'checked-in',
      checkInLocation: locationData
    }

    console.log('Saving check-in record with location:', locationData)
    setAttendanceRecords((current) => [...(current || []), newRecord])
    toast.success(`${t('attendance.checkIn')} ${timeString}${locationData ? ' ✓ تم حفظ الموقع' : ''}`)
  }

  const handleCheckOut = async () => {
    if (geofenceSettings?.enabled && !currentLocation) {
      toast.error('الرجاء السماح بالوصول للموقع لتسجيل الانصراف')
      return
    }

    if (geofenceSettings?.enabled && !isInsideGeofence) {
      toast.error('لا يمكنك تسجيل الانصراف - أنت خارج منطقة العمل المسموحة')
      return
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const timeString = now.toTimeString().split(' ')[0].substring(0, 5)

    const locationData = currentLocation ? {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy: currentLocation.accuracy,
      timestamp: Date.now()
    } : undefined

    console.log('Saving check-out record with location:', locationData)
    setAttendanceRecords((current) => {
      return (current || []).map(record => {
        if (record.employeeId === user.id && record.date === today) {
          return {
            ...record,
            checkOutTime: timeString,
            status: 'checked-out' as const,
            checkOutLocation: locationData
          }
        }
        return record
      })
    })
    toast.success(`${t('attendance.checkOut')} ${timeString}${locationData ? ' ✓ تم حفظ الموقع' : ''}`)
  }

  const todayRecord = getTodayRecord()
  const showCheckInButton = canCheckIn()
  const showCheckOutButton = canCheckOut()
  
  const myRecords = (attendanceRecords || []).filter(r => r.employeeId === user.id)
  
  const myAdvances = (advances || []).filter((a: any) => a.employeeId === user.id && a.status === 'موافق عليه')
  const myBonuses = (bonuses || []).filter((b: any) => b.employeeId === user.id && b.status === 'موافق عليه')
  const myDeductions = (customDeductions || []).filter((d: any) => d.employeeId === user.id && d.status === 'نشط')
  const myLeaveRequests = (leaveRequests || []).filter((l: any) => l.employeeId === user.id)
  
  const totalAdvanceAmount = myAdvances.reduce((sum: number, a: any) => sum + (a.amount || 0), 0)
  const totalMonthlyDeduction = myAdvances.reduce((sum: number, a: any) => sum + (a.monthlyDeduction || a.monthlyInstallment || 0), 0)
  const totalBonusAmount = myBonuses.reduce((sum: number, b: any) => sum + (b.amount || 0), 0)
  const totalCustomDeductionAmount = myDeductions.reduce((sum: number, d: any) => sum + (d.amount || 0), 0)
  
  const approvedLeaves = myLeaveRequests.filter((l: any) => l.status === 'موافق عليه' || l.status === 'موافق عليها')
  const totalLeaveDays = approvedLeaves.reduce((sum: number, l: any) => sum + (l.days || 0), 0)
  
  const estimatedNetSalary = user.salary + totalBonusAmount - totalMonthlyDeduction - totalCustomDeductionAmount

  const getCenterColor = (center: Center): string => {
    if (center === CENTERS.US) return 'bg-center-us'
    if (center === CENTERS.EU) return 'bg-center-eu'
    return 'bg-center-main'
  }

  const getCenterIcon = (center: Center): string => {
    if (center === CENTERS.US) return '🇺🇸'
    if (center === CENTERS.EU) return '🇪🇺'
    return '🏛️'
  }

  interface CenterPerformance {
    center: Center
    totalEmployees: number
    attendanceRate: number
    avgLateMinutes: number
    totalDeductions: number
    rank: number
    color: string
    icon: string
  }

  const calculateCenterPerformance = (): CenterPerformance[] => {
    const centers = [CENTERS.US, CENTERS.EU, CENTERS.MAIN]
    const currentMonth = new Date().toISOString().slice(0, 7)

    const performances: CenterPerformance[] = centers.map(center => {
      const centerEmployees = (employees || []).filter((e: Employee) => e.center === center)
      const totalEmployees = centerEmployees.length

      let totalPresent = 0
      let totalLate = 0
      let totalDeductions = 0
      let totalMinutes = 0
      let recordCount = 0

      Object.entries(dailyRecords || {}).forEach(([date, record]) => {
        if (date.startsWith(currentMonth)) {
          recordCount++
          const centerRecords = (record.employees || record.attendance || []).filter((e: any) => 
            centerEmployees.some((ce: Employee) => ce.id === e.employeeId)
          )

          centerRecords.forEach((r: any) => {
            if ((r.lateMinutes || 0) === 0) totalPresent++
            else totalLate++
            totalMinutes += r.lateMinutes || 0
            totalDeductions += r.deduction || 0
          })
        }
      })

      const attendanceRate = totalEmployees > 0 && recordCount > 0
        ? Math.round((totalPresent / (recordCount * totalEmployees)) * 100)
        : 0

      const avgLateMinutes = totalLate > 0 ? Math.round(totalMinutes / totalLate) : 0

      return {
        center,
        totalEmployees,
        attendanceRate,
        avgLateMinutes,
        totalDeductions,
        rank: 0,
        color: getCenterColor(center),
        icon: getCenterIcon(center)
      }
    })

    performances.sort((a, b) => {
      if (b.attendanceRate !== a.attendanceRate) return b.attendanceRate - a.attendanceRate
      if (a.avgLateMinutes !== b.avgLateMinutes) return a.avgLateMinutes - b.avgLateMinutes
      return a.totalDeductions - b.totalDeductions
    })

    performances.forEach((p, idx) => {
      p.rank = idx + 1
    })

    return performances
  }

  const centerPerformance = calculateCenterPerformance()
  const topCenter = centerPerformance[0]
  const userCenter = centerPerformance.find(c => c.center === user.center)

  return (
    <>
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        isTriggered={isTriggered}
        threshold={80}
      />
      <div className="min-h-screen bg-background p-3 md:p-5 pb-20 md:pb-5" dir={dir}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-3">
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-extrabold mb-1 md:mb-2">{t.dashboard.employeeDashboard}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{t.auth.welcome}، {user.name}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex-1 md:flex-none">
              <LanguageSwitcher />
            </div>
            <Button variant="outline" onClick={onLogout} className="flex-1 md:flex-none min-h-[44px]">
              <Power className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={20} />
              <span className="hidden md:inline">{t.auth.logout}</span>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 gap-1">
            <TabsTrigger value="dashboard" className="min-h-[44px] text-xs md:text-sm">
              <Clock className={dir === 'rtl' ? 'ml-1 md:ml-2' : 'mr-1 md:mr-2'} size={16} />
              <span className="hidden sm:inline">لوحة التحكم</span>
              <span className="sm:hidden">التحكم</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="min-h-[44px] text-xs md:text-sm">
              <User className={dir === 'rtl' ? 'ml-1 md:ml-2' : 'mr-1 md:mr-2'} size={16} />
              <span className="hidden sm:inline">{t.employee.profile}</span>
              <span className="sm:hidden">الملف</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="min-h-[44px] text-xs md:text-sm">
              <MapPin className={dir === 'rtl' ? 'ml-1 md:ml-2' : 'mr-1 md:mr-2'} size={16} />
              <span className="hidden sm:inline">سجل المواقع</span>
              <span className="sm:hidden">المواقع</span>
            </TabsTrigger>
            <TabsTrigger value="report" className="min-h-[44px] text-xs md:text-sm">
              <ShieldWarning className={dir === 'rtl' ? 'ml-1 md:ml-2' : 'mr-1 md:mr-2'} size={16} />
              <span className="hidden sm:inline">بلاغ سري</span>
              <span className="sm:hidden">بلاغ</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAttendanceSection(!showAttendanceSection)}
                className="min-h-[44px] gap-2"
              >
                {showAttendanceSection ? (
                  <>
                    <EyeSlash size={18} weight="duotone" />
                    <span className="text-xs md:text-sm">إخفاء قسم الحضور</span>
                  </>
                ) : (
                  <>
                    <Eye size={18} weight="duotone" />
                    <span className="text-xs md:text-sm">إظهار قسم الحضور</span>
                  </>
                )}
              </Button>
            </div>

            {!showAttendanceSection && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy size={24} weight="fill" className="text-yellow-600" />
                    مقارنة الأداء بين المراكز
                  </CardTitle>
                  <CardDescription>
                    تصنيف المراكز لشهر {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topCenter && (
                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{topCenter.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy size={20} weight="fill" className="text-yellow-600" />
                            <h3 className="font-bold text-yellow-900">المركز الأول</h3>
                          </div>
                          <p className="text-sm font-semibold">{topCenter.center}</p>
                        </div>
                        <Badge className="bg-yellow-500 text-white">🌟 الأفضل</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-green-600 font-bold text-lg">{topCenter.attendanceRate}%</div>
                          <div className="text-muted-foreground">نسبة الحضور</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-blue-600 font-bold text-lg">{topCenter.avgLateMinutes} د</div>
                          <div className="text-muted-foreground">متوسط التأخير</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-purple-600 font-bold text-lg">{topCenter.totalEmployees}</div>
                          <div className="text-muted-foreground">عدد الموظفين</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {userCenter && (
                    <div className={`p-4 rounded-lg border-2 ${
                      userCenter.rank === 1 ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400' :
                      userCenter.rank === 2 ? 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-400' :
                      'bg-gradient-to-br from-orange-50 to-red-50 border-orange-400'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{userCenter.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Medal size={20} weight={userCenter.rank === 1 ? 'fill' : 'regular'} />
                            <h3 className="font-bold">مركزك: {userCenter.center}</h3>
                          </div>
                          <p className="text-sm">
                            {userCenter.rank === 1 && '🏆 مبروك! مركزك في المقدمة'}
                            {userCenter.rank === 2 && '🥈 أداء جيد - قريب من القمة'}
                            {userCenter.rank === 3 && '🥉 يمكنك التحسين - واصل الجهد'}
                          </p>
                        </div>
                        <Badge className={
                          userCenter.rank === 1 ? 'bg-yellow-500 text-white' :
                          userCenter.rank === 2 ? 'bg-gray-500 text-white' :
                          'bg-orange-600 text-white'
                        }>
                          المركز #{userCenter.rank}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-white/80 rounded">
                          <div className={`font-bold text-lg ${
                            userCenter.attendanceRate >= 90 ? 'text-green-600' :
                            userCenter.attendanceRate >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {userCenter.attendanceRate}%
                          </div>
                          <div className="text-muted-foreground">نسبة الحضور</div>
                        </div>
                        <div className="text-center p-2 bg-white/80 rounded">
                          <div className={`font-bold text-lg ${
                            userCenter.avgLateMinutes === 0 ? 'text-green-600' :
                            userCenter.avgLateMinutes <= 15 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {userCenter.avgLateMinutes} د
                          </div>
                          <div className="text-muted-foreground">متوسط التأخير</div>
                        </div>
                        <div className="text-center p-2 bg-white/80 rounded">
                          <div className="text-red-600 font-bold text-lg">{userCenter.totalDeductions}</div>
                          <div className="text-muted-foreground">الخصومات</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Users size={16} />
                      ترتيب جميع المراكز
                    </h4>
                    {centerPerformance.map((center, idx) => (
                      <div 
                        key={center.center}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          center.center === user.center ? 'bg-primary/10 border-2 border-primary' : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            idx === 0 ? 'bg-yellow-100' :
                            idx === 1 ? 'bg-gray-100' :
                            'bg-orange-100'
                          }`}>
                            <span className="font-bold text-sm">#{idx + 1}</span>
                          </div>
                          <span className="text-lg">{center.icon}</span>
                          <div>
                            <div className="font-semibold text-sm line-clamp-1">{center.center}</div>
                            <div className="text-xs text-muted-foreground">
                              {center.attendanceRate}% حضور · {center.avgLateMinutes} د تأخير
                            </div>
                          </div>
                        </div>
                        {idx === 0 && <Trophy size={20} weight="fill" className="text-yellow-600" />}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      💡 <strong>نصيحة:</strong> الحضور المبكر والالتزام اليومي يساعد في رفع تصنيف مركزك
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {showAttendanceSection && buttonSettings?.enabled && (
              <Card className="border-2 border-primary/20">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <Clock size={20} weight="duotone" />
                    {t.attendance.attendance}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t.employee.time}: {currentTime.toLocaleTimeString(dir === 'rtl' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-3 md:space-y-4">
                    {geofenceSettings?.enabled && (
                      <>
                        <Alert className={`border-2 ${isInsideGeofence ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'}`}>
                          <MapPin className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={20} weight="fill" />
                          <AlertDescription className="font-bold text-sm md:text-base">
                            {isInsideGeofence ? (
                              <span className="text-success flex items-center gap-2">
                                ✅ أنت داخل منطقة العمل - يمكنك تسجيل الحضور
                              </span>
                            ) : (
                              <span className="text-destructive flex items-center gap-2">
                                ⚠️ أنت خارج منطقة العمل - لا يمكنك تسجيل الحضور
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                        <div className="mb-4">
                          <GeofenceMap 
                            settings={geofenceSettings} 
                            onLocationUpdate={handleLocationUpdate}
                            showCurrentLocation={true}
                            userCenter={user.center.includes('الامريكي') ? 'us' : user.center.includes('الاوربي') ? 'eu' : 'main'}
                          />
                        </div>
                      </>
                    )}

                    {todayRecord && (
                      <div className="p-3 md:p-4 bg-muted rounded-lg space-y-2">
                        {todayRecord.checkInTime && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{t.attendance.checkIn}:</span>
                            <span className="text-base md:text-lg font-bold text-green-600">{todayRecord.checkInTime}</span>
                          </div>
                        )}
                        {todayRecord.checkOutTime && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{t.attendance.checkOut}:</span>
                            <span className="text-base md:text-lg font-bold text-blue-600">{todayRecord.checkOutTime}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-3 md:gap-4">
                      {showCheckInButton && (
                        <Button 
                          onClick={handleCheckIn}
                          className="w-full h-14 md:h-16 text-base md:text-lg font-bold active:scale-95 transition-transform shadow-lg"
                          size="lg"
                          disabled={geofenceSettings?.enabled && !isInsideGeofence}
                        >
                          <SignIn className={dir === 'rtl' ? 'ml-3' : 'mr-3'} size={28} weight="bold" />
                          {t.attendance.checkIn}
                        </Button>
                      )}
                      
                      {showCheckOutButton && (
                        <Button 
                          onClick={handleCheckOut}
                          variant="secondary"
                          className="w-full h-14 md:h-16 text-base md:text-lg font-bold active:scale-95 transition-transform shadow-lg"
                          size="lg"
                          disabled={geofenceSettings?.enabled && !isInsideGeofence}
                        >
                          <SignOut className={dir === 'rtl' ? 'ml-3' : 'mr-3'} size={28} weight="bold" />
                          {t.attendance.checkOut}
                        </Button>
                      )}

                      {!showCheckInButton && !showCheckOutButton && !todayRecord?.checkInTime && (
                        <div className="w-full p-4 md:p-5 bg-muted rounded-lg text-center">
                          <p className="text-sm md:text-base text-muted-foreground font-medium">
                            وقت تسجيل الحضور: {buttonSettings.checkInStartTime} - {buttonSettings.checkInEndTime}
                          </p>
                        </div>
                      )}

                      {todayRecord?.checkInTime && !showCheckOutButton && !todayRecord?.checkOutTime && (
                        <div className="w-full p-4 md:p-5 bg-muted rounded-lg text-center">
                          <p className="text-sm md:text-base text-muted-foreground font-medium">
                            وقت تسجيل الانصراف: {buttonSettings.checkOutStartTime} - {buttonSettings.checkOutEndTime}
                          </p>
                        </div>
                      )}

                      {todayRecord?.checkOutTime && (
                        <div className="w-full p-4 md:p-5 bg-green-50 border-2 border-green-200 rounded-lg text-center">
                          <p className="text-green-700 font-semibold text-sm md:text-base">
                            ✓ تم تسجيل الحضور والانصراف لهذا اليوم
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                    <Clock className="text-blue-600" size={24} weight="duotone" />
                  </div>
                  <CardTitle className="text-base md:text-lg">وقت الحضور اليوم</CardTitle>
                  <CardDescription className="text-xs md:text-sm">سجل حضورك اليومي</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  {todayRecord?.checkInTime ? (
                    <>
                      <p className="text-2xl md:text-3xl font-bold mb-2">{todayRecord.checkInTime}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {todayRecord.lateMinutes ? `تأخير: ${todayRecord.lateMinutes} دقيقة` : 'في الموعد'}
                      </p>
                    </>
                  ) : (
                    <p className="text-base md:text-lg text-muted-foreground">لم يتم التسجيل بعد</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-3">
                    <CurrencyDollar className="text-green-600" size={24} weight="duotone" />
                  </div>
                  <CardTitle className="text-base md:text-lg">الراتب المتوقع</CardTitle>
                  <CardDescription className="text-xs md:text-sm">صافي الراتب لهذا الشهر</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-2xl md:text-3xl font-bold mb-2">{estimatedNetSalary.toFixed(0)} ريال</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    الراتب الأساسي: {user.salary} ريال
                    {totalBonusAmount > 0 && <span className="text-success"> | مكافآت: +{totalBonusAmount.toFixed(0)}</span>}
                    {(totalMonthlyDeduction + totalCustomDeductionAmount) > 0 && (
                      <span className="text-danger"> | خصومات: -{(totalMonthlyDeduction + totalCustomDeductionAmount).toFixed(0)}</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <CalendarBlank size={20} />
                    رصيد الإجازات
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2 text-sm md:text-base">
                    <div className="flex justify-between">
                      <span>إجازات موافق عليها</span>
                      <span className="font-bold">{approvedLeaves.length} طلب</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي أيام الإجازات</span>
                      <span className="font-bold">{totalLeaveDays} يوم</span>
                    </div>
                    <div className="flex justify-between">
                      <span>طلبات معلقة</span>
                      <span className="font-bold text-warning">
                        {myLeaveRequests.filter((l: any) => l.status === 'معلق' || l.status === 'قيد المراجعة').length} طلب
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    <TrendUp size={20} />
                    الأداء الشهري
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-2 text-sm md:text-base">
                    <div className="flex justify-between">
                      <span>أيام الحضور</span>
                      <span className="font-bold">{myRecords.filter(r => r.checkInTime).length} يوم</span>
                    </div>
                    <div className="flex justify-between">
                      <span>أيام التأخير</span>
                      <span className="font-bold">{myRecords.filter(r => r.lateMinutes && r.lateMinutes > 0).length} يوم</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل الالتزام</span>
                      <span className="font-bold text-green-600">
                        {myRecords.length > 0 
                          ? ((myRecords.filter(r => !r.lateMinutes || r.lateMinutes === 0).length / myRecords.length) * 100).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {showAttendanceSection && topCenter && userCenter && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy size={24} weight="fill" className="text-yellow-600" />
                    مقارنة الأداء بين المراكز
                  </CardTitle>
                  <CardDescription>
                    تصنيف المراكز لشهر {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topCenter && (
                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{topCenter.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy size={20} weight="fill" className="text-yellow-600" />
                            <h3 className="font-bold text-yellow-900">المركز الأول</h3>
                          </div>
                          <p className="text-sm font-semibold">{topCenter.center}</p>
                        </div>
                        <Badge className="bg-yellow-500 text-white">🌟 الأفضل</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-green-600 font-bold text-lg">{topCenter.attendanceRate}%</div>
                          <div className="text-muted-foreground">نسبة الحضور</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-blue-600 font-bold text-lg">{topCenter.avgLateMinutes} د</div>
                          <div className="text-muted-foreground">متوسط التأخير</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-purple-600 font-bold text-lg">{topCenter.totalEmployees}</div>
                          <div className="text-muted-foreground">عدد الموظفين</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {userCenter && (
                    <div className={`p-4 rounded-lg border-2 ${
                      userCenter.rank === 1 ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400' :
                      userCenter.rank === 2 ? 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-400' :
                      'bg-gradient-to-br from-orange-50 to-red-50 border-orange-400'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">{userCenter.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Medal size={20} weight={userCenter.rank === 1 ? 'fill' : 'regular'} />
                            <h3 className="font-bold">مركزك: {userCenter.center}</h3>
                          </div>
                          <p className="text-sm">
                            {userCenter.rank === 1 && '🏆 مبروك! مركزك في المقدمة'}
                            {userCenter.rank === 2 && '🥈 أداء جيد - قريب من القمة'}
                            {userCenter.rank === 3 && '🥉 يمكنك التحسين - واصل الجهد'}
                          </p>
                        </div>
                        <Badge className={
                          userCenter.rank === 1 ? 'bg-yellow-500 text-white' :
                          userCenter.rank === 2 ? 'bg-gray-500 text-white' :
                          'bg-orange-600 text-white'
                        }>
                          المركز #{userCenter.rank}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-white/80 rounded">
                          <div className={`font-bold text-lg ${
                            userCenter.attendanceRate >= 90 ? 'text-green-600' :
                            userCenter.attendanceRate >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {userCenter.attendanceRate}%
                          </div>
                          <div className="text-muted-foreground">نسبة الحضور</div>
                        </div>
                        <div className="text-center p-2 bg-white/80 rounded">
                          <div className={`font-bold text-lg ${
                            userCenter.avgLateMinutes === 0 ? 'text-green-600' :
                            userCenter.avgLateMinutes <= 15 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {userCenter.avgLateMinutes} د
                          </div>
                          <div className="text-muted-foreground">متوسط التأخير</div>
                        </div>
                        <div className="text-center p-2 bg-white/80 rounded">
                          <div className="text-red-600 font-bold text-lg">{userCenter.totalDeductions}</div>
                          <div className="text-muted-foreground">الخصومات</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Users size={16} />
                      ترتيب جميع المراكز
                    </h4>
                    {centerPerformance.map((center, idx) => (
                      <div 
                        key={center.center}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          center.center === user.center ? 'bg-primary/10 border-2 border-primary' : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            idx === 0 ? 'bg-yellow-100' :
                            idx === 1 ? 'bg-gray-100' :
                            'bg-orange-100'
                          }`}>
                            <span className="font-bold text-sm">#{idx + 1}</span>
                          </div>
                          <span className="text-lg">{center.icon}</span>
                          <div>
                            <div className="font-semibold text-sm line-clamp-1">{center.center}</div>
                            <div className="text-xs text-muted-foreground">
                              {center.attendanceRate}% حضور · {center.avgLateMinutes} د تأخير
                            </div>
                          </div>
                        </div>
                        {idx === 0 && <Trophy size={20} weight="fill" className="text-yellow-600" />}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      💡 <strong>نصيحة:</strong> الحضور المبكر والالتزام اليومي يساعد في رفع تصنيف مركزك
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">السلف والمكافآت والخصومات</CardTitle>
                <CardDescription className="text-xs md:text-sm">تفاصيل المستحقات المالية</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-3">
                  {myAdvances.length === 0 && myBonuses.length === 0 && myDeductions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm md:text-base">
                      لا توجد سلف أو مكافآت أو خصومات مسجلة
                    </div>
                  ) : (
                    <>
                      {myAdvances.map((advance: any) => (
                        <div key={advance.id} className="p-3 md:p-4 border rounded-lg border-r-4 border-r-primary">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-sm md:text-base">سلفة - {advance.reason || 'سلفة'}</span>
                            <span className="font-bold text-primary text-sm md:text-base">{advance.amount.toFixed(0)} ريال</span>
                          </div>
                          <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
                            <span>القسط الشهري: {(advance.monthlyDeduction || advance.monthlyInstallment || 0).toFixed(0)} ريال</span>
                            <span>المتبقي: {advance.remainingInstallments} قسط</span>
                          </div>
                        </div>
                      ))}
                      
                      {myBonuses.map((bonus: any) => (
                        <div key={bonus.id} className="p-3 md:p-4 border rounded-lg border-r-4 border-r-success">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-sm md:text-base">مكافأة - {bonus.reason || bonus.type || 'مكافأة'}</span>
                            <span className="font-bold text-success text-sm md:text-base">+{bonus.amount.toFixed(0)} ريال</span>
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                            التاريخ: {bonus.date}
                          </div>
                        </div>
                      ))}
                      
                      {myDeductions.map((deduction: any) => (
                        <div key={deduction.id} className="p-3 md:p-4 border rounded-lg border-r-4 border-r-danger">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-sm md:text-base">خصم - {deduction.reason || deduction.type || 'خصم'}</span>
                            <span className="font-bold text-danger text-sm md:text-base">-{deduction.amount.toFixed(0)} ريال</span>
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                            التاريخ: {deduction.date}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <EmployeeProfileView user={user} onBack={() => {}} />
          </TabsContent>

          <TabsContent value="locations">
            <LocationHistoryView records={myRecords} employeeName={user.name} />
          </TabsContent>

          <TabsContent value="report">
            <AnonymousReportForm userCenter={user.center} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  )
}
