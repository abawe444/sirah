import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Employee, Center, Notification as AppNotification, NotificationPriority, NotificationTargetType } from '@/lib/types'
import { createNotification, requestNotificationPermission, sendBrowserNotification } from '@/lib/notificationManager'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, PaperPlaneTilt, Warning, CalendarBlank, Info, Users, Buildings, User, ChartBar, Check, Eye } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

interface NotificationManagementViewProps {
  employees: Employee[]
  currentUserName: string
  onBack: () => void
}

export function NotificationManagementView({ employees, currentUserName, onBack }: NotificationManagementViewProps) {
  const { t, dir } = useLanguage()
  const [notifications, setNotifications] = useKV<AppNotification[]>('notifications', [])
  
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<NotificationPriority>('attention')
  const [targetType, setTargetType] = useState<NotificationTargetType>('all')
  const [selectedCenter, setSelectedCenter] = useState<Center>()
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([])
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission()
    setNotificationPermission(permission)
    
    if (permission === 'granted') {
      toast.success(t('notifications.browserNotificationsEnabled') as string)
    } else {
      toast.error(t('notifications.browserNotificationsDenied') as string)
    }
  }

  const handleSendNotification = () => {
    if (!title.trim() || !message.trim()) {
      toast.error(dir === 'rtl' ? 'الرجاء إدخال العنوان والرسالة' : 'Please enter title and message')
      return
    }

    if (targetType === 'center' && !selectedCenter) {
      toast.error(dir === 'rtl' ? 'الرجاء اختيار المركز' : 'Please select a center')
      return
    }

    if (targetType === 'specific' && selectedEmployeeIds.length === 0) {
      toast.error(dir === 'rtl' ? 'الرجاء اختيار موظف واحد على الأقل' : 'Please select at least one employee')
      return
    }

    const newNotification = createNotification(
      title,
      message,
      priority,
      targetType,
      currentUserName,
      selectedCenter,
      selectedEmployeeIds
    )

    setNotifications((current) => [...(current || []), newNotification])

    sendBrowserNotification(title, message, priority)

    toast.success(t('notifications.notificationSent') as string)

    setTitle('')
    setMessage('')
    setPriority('attention')
    setTargetType('all')
    setSelectedCenter(undefined)
    setSelectedEmployeeIds([])
  }

  const toggleEmployeeSelection = (employeeId: number) => {
    setSelectedEmployeeIds((current) => {
      if (current.includes(employeeId)) {
        return current.filter(id => id !== employeeId)
      } else {
        return [...current, employeeId]
      }
    })
  }

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return <Warning className="w-5 h-5" />
      case 'meeting':
        return <CalendarBlank className="w-5 h-5" />
      case 'attention':
        return <Info className="w-5 h-5" />
    }
  }

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-danger text-destructive-foreground'
      case 'meeting':
        return 'bg-primary text-primary-foreground'
      case 'attention':
        return 'bg-warning text-warning-foreground'
    }
  }

  const centers: Center[] = ['صرح الاتقان الامريكي 1', 'صرح الاتقان الاوربي 2', 'صرح الاتقان الرئيسي']

  const sentNotifications = (notifications || []).slice().reverse()

  const calculateNotificationStats = () => {
    const totalNotifications = (notifications || []).length
    if (totalNotifications === 0) {
      return {
        totalSent: 0,
        totalRead: 0,
        totalUnread: 0,
        readPercentage: 0,
        byPriority: {
          urgent: { sent: 0, read: 0, readRate: 0 },
          meeting: { sent: 0, read: 0, readRate: 0 },
          attention: { sent: 0, read: 0, readRate: 0 }
        },
        byTargetType: {
          all: { sent: 0, read: 0, readRate: 0 },
          center: { sent: 0, read: 0, readRate: 0 },
          specific: { sent: 0, read: 0, readRate: 0 }
        },
        detailedStats: []
      }
    }

    let totalReadCount = 0
    const byPriority: Record<NotificationPriority, { sent: number; read: number; readRate: number }> = {
      urgent: { sent: 0, read: 0, readRate: 0 },
      meeting: { sent: 0, read: 0, readRate: 0 },
      attention: { sent: 0, read: 0, readRate: 0 }
    }
    const byTargetType: Record<NotificationTargetType, { sent: number; read: number; readRate: number }> = {
      all: { sent: 0, read: 0, readRate: 0 },
      center: { sent: 0, read: 0, readRate: 0 },
      specific: { sent: 0, read: 0, readRate: 0 }
    }

    const detailedStats = (notifications || []).map(notif => {
      const targetEmployees = getTargetEmployees(notif)
      const targetCount = targetEmployees.length
      const readCount = notif.readBy.length
      const unreadCount = targetCount - readCount
      const readRate = targetCount > 0 ? (readCount / targetCount) * 100 : 0

      totalReadCount += readCount

      byPriority[notif.priority].sent += 1
      byPriority[notif.priority].read += readCount
      
      byTargetType[notif.targetType].sent += 1
      byTargetType[notif.targetType].read += readCount

      return {
        notification: notif,
        targetCount,
        readCount,
        unreadCount,
        readRate,
        readEmployees: targetEmployees.filter(emp => notif.readBy.includes(emp.id)),
        unreadEmployees: targetEmployees.filter(emp => !notif.readBy.includes(emp.id))
      }
    })

    Object.keys(byPriority).forEach(priority => {
      const key = priority as NotificationPriority
      const sent = byPriority[key].sent
      byPriority[key].readRate = sent > 0 ? (byPriority[key].read / sent) : 0
    })

    Object.keys(byTargetType).forEach(targetType => {
      const key = targetType as NotificationTargetType
      const sent = byTargetType[key].sent
      byTargetType[key].readRate = sent > 0 ? (byTargetType[key].read / sent) : 0
    })

    const totalTargets = detailedStats.reduce((sum, stat) => sum + stat.targetCount, 0)
    const readPercentage = totalTargets > 0 ? (totalReadCount / totalTargets) * 100 : 0

    return {
      totalSent: totalNotifications,
      totalRead: totalReadCount,
      totalUnread: totalTargets - totalReadCount,
      readPercentage,
      byPriority,
      byTargetType,
      detailedStats
    }
  }

  const getTargetEmployees = (notif: AppNotification): Employee[] => {
    if (notif.targetType === 'all') {
      return employees
    } else if (notif.targetType === 'center' && notif.targetCenter) {
      return employees.filter(emp => emp.center === notif.targetCenter)
    } else if (notif.targetType === 'specific' && notif.targetEmployeeIds) {
      return employees.filter(emp => notif.targetEmployeeIds!.includes(emp.id))
    }
    return []
  }

  const stats = calculateNotificationStats()

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="min-h-[44px]">
          {dir === 'rtl' ? '← ' : '→ '}{t('dashboard.backToDashboard')}
        </Button>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="send" className="min-h-[44px] text-xs md:text-sm py-2 md:py-2.5">
            <Bell className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
            <span className="hidden sm:inline">{dir === 'rtl' ? 'إرسال إشعار' : 'Send Notification'}</span>
            <span className="sm:hidden">{dir === 'rtl' ? 'إرسال' : 'Send'}</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="min-h-[44px] text-xs md:text-sm py-2 md:py-2.5">
            <Eye className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
            <span className="hidden sm:inline">{dir === 'rtl' ? 'السجل' : 'History'}</span>
            <span className="sm:hidden">{dir === 'rtl' ? 'سجل' : 'Log'}</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="min-h-[44px] text-xs md:text-sm py-2 md:py-2.5">
            <ChartBar className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
            <span className="hidden sm:inline">{dir === 'rtl' ? 'الإحصائيات' : 'Statistics'}</span>
            <span className="sm:hidden">{dir === 'rtl' ? 'إحصاء' : 'Stats'}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            {t('notifications.sendNotification')}
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            {dir === 'rtl' ? 'إرسال إشعار للموظفين - سيتم إرسال إشعار المتصفح للموظفين حتى لو كان التطبيق مغلقاً' : 'Send notification to employees - browser notifications will be sent even if app is closed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          {notificationPermission !== 'granted' && (
            <div className="p-4 border border-warning rounded-lg bg-warning/10 space-y-2">
              <p className="text-sm font-semibold">
                {dir === 'rtl' ? 'تفعيل إشعارات المتصفح' : 'Enable Browser Notifications'}
              </p>
              <p className="text-sm text-muted-foreground">
                {dir === 'rtl' ? 'للحصول على الإشعارات حتى عندما يكون التطبيق مغلقاً' : 'To receive notifications even when the app is closed'}
              </p>
              <Button onClick={handleRequestPermission} variant="outline" size="sm">
                {t('notifications.enableBrowserNotifications')}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notification-title">{t('notifications.notificationTitle')}</Label>
            <Input
              id="notification-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={dir === 'rtl' ? 'مثال: اجتماع طارئ' : 'Example: Emergency Meeting'}
              className="min-h-[44px]"
              dir={dir}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-message">{t('notifications.notificationMessage')}</Label>
            <Textarea
              id="notification-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={dir === 'rtl' ? 'أدخل رسالة الإشعار...' : 'Enter notification message...'}
              rows={4}
              className="resize-none"
              dir={dir}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">{t('notifications.priority')}</Label>
            <Select value={priority} onValueChange={(value: NotificationPriority) => setPriority(value)}>
              <SelectTrigger id="priority" className="min-h-[44px]" dir={dir}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <Warning className="w-4 h-4 text-danger" />
                    <span>{t('notifications.urgent')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="meeting">
                  <div className="flex items-center gap-2">
                    <CalendarBlank className="w-4 h-4 text-primary" />
                    <span>{t('notifications.meeting')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="attention">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-warning" />
                    <span>{t('notifications.attention')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-type">{t('notifications.targetType')}</Label>
            <Select value={targetType} onValueChange={(value: NotificationTargetType) => setTargetType(value)}>
              <SelectTrigger id="target-type" className="min-h-[44px]" dir={dir}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{t('notifications.all')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="center">
                  <div className="flex items-center gap-2">
                    <Buildings className="w-4 h-4" />
                    <span>{t('notifications.center')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="specific">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{t('notifications.specific')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {targetType === 'center' && (
            <div className="space-y-2">
              <Label htmlFor="select-center">{t('notifications.selectCenter')}</Label>
              <Select value={selectedCenter} onValueChange={(value: Center) => setSelectedCenter(value)}>
                <SelectTrigger id="select-center" className="min-h-[44px]" dir={dir}>
                  <SelectValue placeholder={dir === 'rtl' ? 'اختر المركز' : 'Select Center'} />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem key={center} value={center}>
                      {center}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {targetType === 'specific' && (
            <div className="space-y-2">
              <Label>{t('notifications.selectEmployees')}</Label>
              <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`employee-${employee.id}`}
                      checked={selectedEmployeeIds.includes(employee.id)}
                      onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                    />
                    <Label
                      htmlFor={`employee-${employee.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {employee.name} - {employee.center}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleSendNotification} className="w-full min-h-[44px]" size="lg">
            <PaperPlaneTilt className="w-5 h-5 mr-2" />
            {t('notifications.send')}
          </Button>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dir === 'rtl' ? 'الإشعارات المرسلة' : 'Sent Notifications'}</CardTitle>
          <CardDescription>
            {dir === 'rtl' ? 'سجل الإشعارات المرسلة' : 'History of sent notifications'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentNotifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t('notifications.noNotifications')}
            </p>
          ) : (
            <div className="space-y-4">
              {sentNotifications.map((notif) => {
                const targetEmployees = getTargetEmployees(notif)
                const readCount = notif.readBy.length
                const targetCount = targetEmployees.length
                const readRate = targetCount > 0 ? (readCount / targetCount) * 100 : 0

                return (
                  <div key={notif.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2 justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        {getPriorityIcon(notif.priority)}
                        <div className="flex-1">
                          <h4 className="font-semibold">{notif.title}</h4>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(notif.priority)}>
                        {t(`notifications.${notif.priority}`)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {dir === 'rtl' ? 'معدل القراءة' : 'Read Rate'}
                        </span>
                        <span className="font-semibold">
                          {readCount} / {targetCount} ({readRate.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={readRate} className="h-2" />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>{t('notifications.from')}: {notif.createdBy}</span>
                      <span>•</span>
                      <span>{new Date(notif.createdAt).toLocaleString(dir === 'rtl' ? 'ar-SA' : 'en-US')}</span>
                      <span>•</span>
                      <span>
                        {notif.targetType === 'all' && t('notifications.all')}
                        {notif.targetType === 'center' && `${t('employee.center')}: ${notif.targetCenter}`}
                        {notif.targetType === 'specific' && `${notif.targetEmployeeIds?.length} ${t('employee.employees')}`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{dir === 'rtl' ? 'إجمالي المرسل' : 'Total Sent'}</CardDescription>
                <CardTitle className="text-3xl">{stats.totalSent}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {dir === 'rtl' ? 'إشعار مرسل' : 'notifications sent'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{dir === 'rtl' ? 'إجمالي المقروء' : 'Total Read'}</CardDescription>
                <CardTitle className="text-3xl text-success">{stats.totalRead}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {dir === 'rtl' ? 'قراءة' : 'reads'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{dir === 'rtl' ? 'لم يُقرأ' : 'Unread'}</CardDescription>
                <CardTitle className="text-3xl text-warning">{stats.totalUnread}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {dir === 'rtl' ? 'غير مقروء' : 'unread'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{dir === 'rtl' ? 'معدل القراءة' : 'Read Rate'}</CardDescription>
                <CardTitle className="text-3xl text-primary">{stats.readPercentage.toFixed(0)}%</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={stats.readPercentage} className="h-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{dir === 'rtl' ? 'إحصائيات حسب الأولوية' : 'Statistics by Priority'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.byPriority).map(([priority, data]) => (
                  <div key={priority} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(priority as NotificationPriority)}
                        <span className="font-medium">
                          {t(`notifications.${priority}`)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {data.read} / {data.sent} {dir === 'rtl' ? 'قراءة' : 'reads'}
                      </span>
                    </div>
                    <Progress 
                      value={data.sent > 0 ? (data.read / data.sent) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{dir === 'rtl' ? 'إحصائيات حسب الفئة المستهدفة' : 'Statistics by Target Type'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.byTargetType).map(([targetType, data]) => (
                  <div key={targetType} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {targetType === 'all' && <Users className="w-4 h-4" />}
                        {targetType === 'center' && <Buildings className="w-4 h-4" />}
                        {targetType === 'specific' && <User className="w-4 h-4" />}
                        <span className="font-medium">
                          {t(`notifications.${targetType}`)}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {data.read} / {data.sent} {dir === 'rtl' ? 'قراءة' : 'reads'}
                      </span>
                    </div>
                    <Progress 
                      value={data.sent > 0 ? (data.read / data.sent) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{dir === 'rtl' ? 'تفاصيل الإشعارات' : 'Notification Details'}</CardTitle>
              <CardDescription>
                {dir === 'rtl' ? 'تقرير مفصل عن كل إشعار' : 'Detailed report for each notification'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.detailedStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t('notifications.noNotifications')}
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.detailedStats.slice().reverse().map((stat) => (
                    <div key={stat.notification.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getPriorityIcon(stat.notification.priority)}
                            <h4 className="font-semibold">{stat.notification.title}</h4>
                            <Badge className={getPriorityColor(stat.notification.priority)}>
                              {t(`notifications.${stat.notification.priority}`)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{stat.notification.message}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">{dir === 'rtl' ? 'المستهدفون' : 'Targeted'}</p>
                          <p className="font-semibold">{stat.targetCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">{dir === 'rtl' ? 'قرأوا' : 'Read'}</p>
                          <p className="font-semibold text-success">{stat.readCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">{dir === 'rtl' ? 'لم يقرأوا' : 'Unread'}</p>
                          <p className="font-semibold text-warning">{stat.unreadCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">{dir === 'rtl' ? 'معدل القراءة' : 'Read Rate'}</p>
                          <p className="font-semibold text-primary">{stat.readRate.toFixed(0)}%</p>
                        </div>
                      </div>

                      <Progress value={stat.readRate} className="h-2" />

                      <div className="pt-2 border-t">
                        <details className="group">
                          <summary className="cursor-pointer text-sm font-medium flex items-center gap-2 hover:text-primary">
                            <Check className="w-4 h-4" />
                            {dir === 'rtl' ? `الموظفون الذين قرأوا (${stat.readCount})` : `Read by (${stat.readCount})`}
                          </summary>
                          <div className="mt-2 space-y-1 pl-6">
                            {stat.readEmployees.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                {dir === 'rtl' ? 'لا يوجد' : 'None'}
                              </p>
                            ) : (
                              stat.readEmployees.map(emp => (
                                <p key={emp.id} className="text-xs text-muted-foreground">
                                  • {emp.name} - {emp.center}
                                </p>
                              ))
                            )}
                          </div>
                        </details>
                      </div>

                      {stat.unreadCount > 0 && (
                        <div className="pt-2 border-t">
                          <details className="group">
                            <summary className="cursor-pointer text-sm font-medium flex items-center gap-2 hover:text-primary">
                              <Eye className="w-4 h-4" />
                              {dir === 'rtl' ? `الموظفون الذين لم يقرأوا (${stat.unreadCount})` : `Unread by (${stat.unreadCount})`}
                            </summary>
                            <div className="mt-2 space-y-1 pl-6">
                              {stat.unreadEmployees.map(emp => (
                                <p key={emp.id} className="text-xs text-warning">
                                  • {emp.name} - {emp.center}
                                </p>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        {new Date(stat.notification.createdAt).toLocaleString(dir === 'rtl' ? 'ar-SA' : 'en-US')} • {stat.notification.createdBy}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
