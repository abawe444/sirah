import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Employee, AttendanceButtonSettings, GeofenceSettings } from '@/lib/types'
import { Gear, UserCircle, Clock, CurrencyDollar, ClockClockwise, MapTrifold, DeviceMobile } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { GeofenceSettingsView } from '@/components/GeofenceSettingsView'
import { PWAManager } from '@/components/PWAManager'

interface AdminSettingsViewProps {
  currentUser: Employee
  employees: Employee[]
  onUpdateEmployee: (employeeId: number, updates: Partial<Employee>) => void
  onUpdateDeductionRules: (rules: DeductionRules) => void
  deductionRules: DeductionRules
}

export interface DeductionRules {
  baseDeductionRules: {
    noDeduction: number
    level1: { minutes: number; amount: number }
    level2: { minutes: number; amount: number }
    level3: { minutes: number; amount: number }
    maxDeduction: number
  }
  employeeCustomRules: Record<number, {
    enabled: boolean
    noDeduction?: number
    level1?: { minutes: number; amount: number }
    level2?: { minutes: number; amount: number }
    level3?: { minutes: number; amount: number }
    maxDeduction?: number
  }>
}

export function AdminSettingsView({
  currentUser,
  employees,
  onUpdateEmployee,
  onUpdateDeductionRules,
  deductionRules
}: AdminSettingsViewProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [customRuleEnabled, setCustomRuleEnabled] = useState(false)
  const [customNoDeduction, setCustomNoDeduction] = useState(30)
  const [customLevel1Minutes, setCustomLevel1Minutes] = useState(45)
  const [customLevel1Amount, setCustomLevel1Amount] = useState(15)
  const [customLevel2Minutes, setCustomLevel2Minutes] = useState(60)
  const [customLevel2Amount, setCustomLevel2Amount] = useState(30)
  const [customLevel3Minutes, setCustomLevel3Minutes] = useState(120)
  const [customLevel3Amount, setCustomLevel3Amount] = useState(40)
  const [customMaxDeduction, setCustomMaxDeduction] = useState(45)

  const [baseNoDeduction, setBaseNoDeduction] = useState(deductionRules.baseDeductionRules.noDeduction)
  const [baseLevel1Minutes, setBaseLevel1Minutes] = useState(deductionRules.baseDeductionRules.level1.minutes)
  const [baseLevel1Amount, setBaseLevel1Amount] = useState(deductionRules.baseDeductionRules.level1.amount)
  const [baseLevel2Minutes, setBaseLevel2Minutes] = useState(deductionRules.baseDeductionRules.level2.minutes)
  const [baseLevel2Amount, setBaseLevel2Amount] = useState(deductionRules.baseDeductionRules.level2.amount)
  const [baseLevel3Minutes, setBaseLevel3Minutes] = useState(deductionRules.baseDeductionRules.level3.minutes)
  const [baseLevel3Amount, setBaseLevel3Amount] = useState(deductionRules.baseDeductionRules.level3.amount)
  const [baseMaxDeduction, setBaseMaxDeduction] = useState(deductionRules.baseDeductionRules.maxDeduction)

  const [buttonSettings, setButtonSettings] = useKV<AttendanceButtonSettings>('attendance-button-settings', {
    checkInStartTime: '06:00',
    checkInEndTime: '10:00',
    checkOutStartTime: '14:00',
    checkOutEndTime: '23:59',
    enabled: true
  })

  const [geofenceSettings, setGeofenceSettings] = useKV<GeofenceSettings>('geofence-settings', {
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

  const handleUpdateCredentials = () => {
    if (!selectedEmployeeId) {
      toast.error('الرجاء اختيار موظف')
      return
    }

    if (newUsername.trim() === '' && newPassword.trim() === '') {
      toast.error('الرجاء إدخال اسم مستخدم أو كلمة مرور جديدة')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('كلمات المرور غير متطابقة')
      return
    }

    const updates: Partial<Employee> = {}
    if (newUsername.trim()) updates.username = newUsername.trim()
    if (newPassword.trim()) updates.password = newPassword.trim()

    onUpdateEmployee(selectedEmployeeId, updates)
    
    setNewUsername('')
    setNewPassword('')
    setConfirmPassword('')
    toast.success('تم تحديث البيانات بنجاح')
  }

  const handleUpdateBaseRules = () => {
    onUpdateDeductionRules({
      ...deductionRules,
      baseDeductionRules: {
        noDeduction: baseNoDeduction,
        level1: { minutes: baseLevel1Minutes, amount: baseLevel1Amount },
        level2: { minutes: baseLevel2Minutes, amount: baseLevel2Amount },
        level3: { minutes: baseLevel3Minutes, amount: baseLevel3Amount },
        maxDeduction: baseMaxDeduction
      }
    })
    toast.success('تم تحديث القواعد الأساسية بنجاح')
  }

  const handleUpdateEmployeeCustomRule = () => {
    if (!selectedEmployeeId) {
      toast.error('الرجاء اختيار موظف')
      return
    }

    const newCustomRules = { ...deductionRules.employeeCustomRules }
    
    if (customRuleEnabled) {
      newCustomRules[selectedEmployeeId] = {
        enabled: true,
        noDeduction: customNoDeduction,
        level1: { minutes: customLevel1Minutes, amount: customLevel1Amount },
        level2: { minutes: customLevel2Minutes, amount: customLevel2Amount },
        level3: { minutes: customLevel3Minutes, amount: customLevel3Amount },
        maxDeduction: customMaxDeduction
      }
    } else {
      delete newCustomRules[selectedEmployeeId]
    }

    onUpdateDeductionRules({
      ...deductionRules,
      employeeCustomRules: newCustomRules
    })

    toast.success('تم تحديث القواعد الخاصة بالموظف بنجاح')
  }

  const handleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployeeId(employeeId)
    const customRule = deductionRules.employeeCustomRules[employeeId]
    
    if (customRule && customRule.enabled) {
      setCustomRuleEnabled(true)
      setCustomNoDeduction(customRule.noDeduction || 30)
      setCustomLevel1Minutes(customRule.level1?.minutes || 45)
      setCustomLevel1Amount(customRule.level1?.amount || 15)
      setCustomLevel2Minutes(customRule.level2?.minutes || 60)
      setCustomLevel2Amount(customRule.level2?.amount || 30)
      setCustomLevel3Minutes(customRule.level3?.minutes || 120)
      setCustomLevel3Amount(customRule.level3?.amount || 40)
      setCustomMaxDeduction(customRule.maxDeduction || 45)
    } else {
      setCustomRuleEnabled(false)
      setCustomNoDeduction(30)
      setCustomLevel1Minutes(45)
      setCustomLevel1Amount(15)
      setCustomLevel2Minutes(60)
      setCustomLevel2Amount(30)
      setCustomLevel3Minutes(120)
      setCustomLevel3Amount(40)
      setCustomMaxDeduction(45)
    }
  }

  const handleUpdateButtonSettings = () => {
    setButtonSettings((current) => ({
      ...(current || {}),
      checkInStartTime: buttonSettings?.checkInStartTime || '06:00',
      checkInEndTime: buttonSettings?.checkInEndTime || '10:00',
      checkOutStartTime: buttonSettings?.checkOutStartTime || '14:00',
      checkOutEndTime: buttonSettings?.checkOutEndTime || '23:59',
      enabled: buttonSettings?.enabled ?? true
    }))
    toast.success('تم تحديث إعدادات أزرار الحضور بنجاح')
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Gear size={28} weight="duotone" className="text-primary md:w-8 md:h-8" />
        <h2 className="text-2xl md:text-3xl font-extrabold">إعدادات النظام</h2>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-1 h-auto">
          <TabsTrigger value="users" className="text-xs md:text-sm py-2 md:py-2.5">
            <UserCircle className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">المستخدمين</span>
            <span className="sm:hidden">مستخدمين</span>
          </TabsTrigger>
          <TabsTrigger value="pwa" className="text-xs md:text-sm py-2 md:py-2.5">
            <DeviceMobile className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">PWA والإشعارات</span>
            <span className="sm:hidden">PWA</span>
          </TabsTrigger>
          <TabsTrigger value="geofence" className="text-xs md:text-sm py-2 md:py-2.5">
            <MapTrifold className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">السياج الجغرافي</span>
            <span className="sm:hidden">سياج</span>
          </TabsTrigger>
          <TabsTrigger value="attendance-buttons" className="text-xs md:text-sm py-2 md:py-2.5">
            <ClockClockwise className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">أزرار الحضور</span>
            <span className="sm:hidden">حضور</span>
          </TabsTrigger>
          <TabsTrigger value="base-rules" className="text-xs md:text-sm py-2 md:py-2.5">
            <Clock className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">قواعد الخصم</span>
            <span className="sm:hidden">خصم</span>
          </TabsTrigger>
          <TabsTrigger value="employee-rules" className="text-xs md:text-sm py-2 md:py-2.5">
            <CurrencyDollar className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">قواعد خاصة</span>
            <span className="sm:hidden">خاصة</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pwa" className="space-y-4">
          <PWAManager />
        </TabsContent>

        <TabsContent value="geofence" className="space-y-4">
          <GeofenceSettingsView 
            settings={geofenceSettings || {
              enabled: false,
              centerLatitude: 21.3891,
              centerLongitude: 39.8579,
              radiusInMeters: 200,
              allowedCenters: {
                'us': { name: 'المركز الأمريكي', latitude: 21.3891, longitude: 39.8579, radius: 200 },
                'eu': { name: 'المركز الأوروبي', latitude: 21.3920, longitude: 39.8600, radius: 200 },
                'main': { name: 'المركز الرئيسي', latitude: 21.3850, longitude: 39.8550, radius: 200 }
              }
            }}
            onSave={setGeofenceSettings}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إدارة حسابات الموظفين</CardTitle>
              <CardDescription>
                تعديل اسم المستخدم وكلمة المرور لجميع الموظفين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>اختر الموظف</Label>
                <Select value={selectedEmployeeId.toString()} onValueChange={(val) => setSelectedEmployeeId(parseInt(val))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر موظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(employees) && employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name} ({emp.role === 'admin' ? 'مسؤول' : 'موظف'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-username">اسم المستخدم الجديد (اختياري)</Label>
                <Input
                  id="new-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="اترك فارغاً إذا لم ترد التغيير"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">كلمة المرور الجديدة (اختياري)</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="اترك فارغاً إذا لم ترد التغيير"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                />
              </div>

              <Button onClick={handleUpdateCredentials} className="w-full">
                تحديث البيانات
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>قائمة الموظفين</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>اسم المستخدم</TableHead>
                    <TableHead>الدور</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(employees) && employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-semibold">{emp.name}</TableCell>
                      <TableCell>{emp.username}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          emp.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary-foreground'
                        }`}>
                          {emp.role === 'admin' ? 'مسؤول' : 'موظف'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance-buttons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات أزرار تسجيل الحضور والانصراف</CardTitle>
              <CardDescription>
                تحديد المواعيد المسموح بها لتسجيل الحضور والانصراف من قبل الموظفين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">تفعيل أزرار الحضور/الانصراف</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح للموظفين بتسجيل الحضور والانصراف من لوحة التحكم الخاصة بهم
                  </p>
                </div>
                <Switch
                  checked={buttonSettings?.enabled ?? true}
                  onCheckedChange={(checked) => {
                    setButtonSettings((current) => ({
                      ...(current || {
                        checkInStartTime: '06:00',
                        checkInEndTime: '10:00',
                        checkOutStartTime: '14:00',
                        checkOutEndTime: '23:59'
                      }),
                      enabled: checked
                    }))
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    تسجيل الحضور
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="check-in-start">وقت البداية</Label>
                    <Input
                      id="check-in-start"
                      type="time"
                      value={buttonSettings?.checkInStartTime || '06:00'}
                      onChange={(e) => {
                        setButtonSettings((current) => ({
                          ...(current || {
                            checkInEndTime: '10:00',
                            checkOutStartTime: '14:00',
                            checkOutEndTime: '23:59',
                            enabled: true
                          }),
                          checkInStartTime: e.target.value
                        }))
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      أول وقت يمكن للموظف تسجيل الحضور فيه
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="check-in-end">وقت النهاية</Label>
                    <Input
                      id="check-in-end"
                      type="time"
                      value={buttonSettings?.checkInEndTime || '10:00'}
                      onChange={(e) => {
                        setButtonSettings((current) => ({
                          ...(current || {
                            checkInStartTime: '06:00',
                            checkOutStartTime: '14:00',
                            checkOutEndTime: '23:59',
                            enabled: true
                          }),
                          checkInEndTime: e.target.value
                        }))
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      آخر وقت يمكن للموظف تسجيل الحضور فيه
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg bg-green-50/50">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ClockClockwise size={20} className="text-green-600" />
                    تسجيل الانصراف
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="check-out-start">وقت البداية</Label>
                    <Input
                      id="check-out-start"
                      type="time"
                      value={buttonSettings?.checkOutStartTime || '14:00'}
                      onChange={(e) => {
                        setButtonSettings((current) => ({
                          ...(current || {
                            checkInStartTime: '06:00',
                            checkInEndTime: '10:00',
                            checkOutEndTime: '23:59',
                            enabled: true
                          }),
                          checkOutStartTime: e.target.value
                        }))
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      أول وقت يمكن للموظف تسجيل الانصراف فيه
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="check-out-end">وقت النهاية</Label>
                    <Input
                      id="check-out-end"
                      type="time"
                      value={buttonSettings?.checkOutEndTime || '23:59'}
                      onChange={(e) => {
                        setButtonSettings((current) => ({
                          ...(current || {
                            checkInStartTime: '06:00',
                            checkInEndTime: '10:00',
                            checkOutStartTime: '14:00',
                            enabled: true
                          }),
                          checkOutEndTime: e.target.value
                        }))
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      آخر وقت يمكن للموظف تسجيل الانصراف فيه
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">ملخص الإعدادات الحالية:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• تسجيل الحضور: من {buttonSettings?.checkInStartTime || '06:00'} إلى {buttonSettings?.checkInEndTime || '10:00'}</li>
                  <li>• تسجيل الانصراف: من {buttonSettings?.checkOutStartTime || '14:00'} إلى {buttonSettings?.checkOutEndTime || '23:59'}</li>
                  <li>• الحالة: {buttonSettings?.enabled ? 'مفعل ✓' : 'معطل ✗'}</li>
                </ul>
              </div>

              <Button onClick={handleUpdateButtonSettings} className="w-full">
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="base-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>القواعد الأساسية للخصم</CardTitle>
              <CardDescription>
                هذه القواعد تطبق على جميع الموظفين ما لم يكن لديهم قاعدة خاصة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الحد الأقصى بدون خصم (دقائق)</Label>
                  <Input
                    type="number"
                    value={baseNoDeduction}
                    onChange={(e) => setBaseNoDeduction(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    الموظف لن يُخصم منه شيء حتى هذه الدقائق
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>الخصم الأقصى (نقاط)</Label>
                  <Input
                    type="number"
                    value={baseMaxDeduction}
                    onChange={(e) => setBaseMaxDeduction(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    الحد الأقصى للخصم اليومي
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold">مستويات الخصم</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label>المستوى 1 - حتى (دقائق)</Label>
                    <Input
                      type="number"
                      value={baseLevel1Minutes}
                      onChange={(e) => setBaseLevel1Minutes(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المستوى 1 - الخصم (نقاط)</Label>
                    <Input
                      type="number"
                      value={baseLevel1Amount}
                      onChange={(e) => setBaseLevel1Amount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label>المستوى 2 - حتى (دقائق)</Label>
                    <Input
                      type="number"
                      value={baseLevel2Minutes}
                      onChange={(e) => setBaseLevel2Minutes(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المستوى 2 - الخصم (نقاط)</Label>
                    <Input
                      type="number"
                      value={baseLevel2Amount}
                      onChange={(e) => setBaseLevel2Amount(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label>المستوى 3 - حتى (دقائق)</Label>
                    <Input
                      type="number"
                      value={baseLevel3Minutes}
                      onChange={(e) => setBaseLevel3Minutes(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>المستوى 3 - الخصم (نقاط)</Label>
                    <Input
                      type="number"
                      value={baseLevel3Amount}
                      onChange={(e) => setBaseLevel3Amount(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleUpdateBaseRules} className="w-full">
                حفظ القواعد الأساسية
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employee-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قواعد خاصة بموظف معين</CardTitle>
              <CardDescription>
                تطبيق قواعد خصم مخصصة لموظف محدد تتجاوز القواعد الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>اختر الموظف</Label>
                <Select 
                  value={selectedEmployeeId.toString()} 
                  onValueChange={(val) => handleEmployeeSelection(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر موظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(employees) && employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.name} - {emp.center}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="custom-rule-enabled"
                  checked={customRuleEnabled}
                  onChange={(e) => setCustomRuleEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="custom-rule-enabled">تفعيل قاعدة خاصة لهذا الموظف</Label>
              </div>

              {customRuleEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الحد الأقصى بدون خصم (دقائق)</Label>
                      <Input
                        type="number"
                        value={customNoDeduction}
                        onChange={(e) => setCustomNoDeduction(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الخصم الأقصى (نقاط)</Label>
                      <Input
                        type="number"
                        value={customMaxDeduction}
                        onChange={(e) => setCustomMaxDeduction(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-semibold">مستويات الخصم المخصصة</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <Label>المستوى 1 - حتى (دقائق)</Label>
                        <Input
                          type="number"
                          value={customLevel1Minutes}
                          onChange={(e) => setCustomLevel1Minutes(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>المستوى 1 - الخصم (نقاط)</Label>
                        <Input
                          type="number"
                          value={customLevel1Amount}
                          onChange={(e) => setCustomLevel1Amount(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <Label>المستوى 2 - حتى (دقائق)</Label>
                        <Input
                          type="number"
                          value={customLevel2Minutes}
                          onChange={(e) => setCustomLevel2Minutes(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>المستوى 2 - الخصم (نقاط)</Label>
                        <Input
                          type="number"
                          value={customLevel2Amount}
                          onChange={(e) => setCustomLevel2Amount(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div className="space-y-2">
                        <Label>المستوى 3 - حتى (دقائق)</Label>
                        <Input
                          type="number"
                          value={customLevel3Minutes}
                          onChange={(e) => setCustomLevel3Minutes(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>المستوى 3 - الخصم (نقاط)</Label>
                        <Input
                          type="number"
                          value={customLevel3Amount}
                          onChange={(e) => setCustomLevel3Amount(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Button 
                onClick={handleUpdateEmployeeCustomRule} 
                className="w-full"
                disabled={!selectedEmployeeId}
              >
                حفظ القواعد الخاصة
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الموظفون ذوو القواعد الخاصة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>بدون خصم</TableHead>
                    <TableHead>الخصم الأقصى</TableHead>
                    <TableHead>إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(deductionRules.employeeCustomRules).map(([empId, rule]) => {
                    const employee = employees.find(e => e.id === Number(empId))
                    if (!employee) return null
                    
                    return (
                      <TableRow key={empId}>
                        <TableCell className="font-semibold">{employee.name}</TableCell>
                        <TableCell>{rule.noDeduction} دقيقة</TableCell>
                        <TableCell>{rule.maxDeduction} ريال</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEmployeeSelection(Number(empId))}
                          >
                            تعديل
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {Object.keys(deductionRules.employeeCustomRules).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        لا توجد قواعد خاصة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
