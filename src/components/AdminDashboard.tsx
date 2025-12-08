import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ChartBar, CurrencyDollar, CalendarBlank, Power, Gear, Wallet, UserPlus, Database, ShieldWarning, Bell, Trophy, Trash } from '@phosphor-icons/react'
import { Employee } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AdminDashboardProps {
  user: Employee
  onLogout: () => void
  onNavigate: (view: string) => void
  onResetData?: () => void
  onClearAllData?: () => void
}

export function AdminDashboard({ user, onLogout, onNavigate, onResetData, onClearAllData }: AdminDashboardProps) {
  const { t, dir } = useLanguage()
  
  const adminModules = [
    {
      id: 'daily',
      title: t.navigation.daily,
      description: t.attendance.attendance,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'history',
      title: t.navigation.history,
      description: t.stats.statistics,
      icon: ChartBar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'analytics',
      title: 'تحليلات السجلات',
      description: 'تحليلات متقدمة ونسخ احتياطي',
      icon: Database,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      id: 'comparison',
      title: t.navigation.comparison,
      description: 'التنافس والأداء',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'payroll',
      title: t.navigation.payroll,
      description: t.payroll.payroll,
      icon: CurrencyDollar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'leave',
      title: t.navigation.leave,
      description: t.leave.leaves,
      icon: CalendarBlank,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'advances',
      title: t.navigation.advances,
      description: t.payroll.advances,
      icon: Wallet,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'users',
      title: t.navigation.users,
      description: t.employee.addEmployee,
      icon: UserPlus,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'settings',
      title: t.navigation.settings,
      description: t.settings.settings,
      icon: Gear,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      id: 'reports',
      title: 'البلاغات السرية',
      description: 'إدارة البلاغات السرية',
      icon: ShieldWarning,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'notifications',
      title: t.notifications.notifications,
      description: t.notifications.sendNotification,
      icon: Bell,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ]

  return (
    <div className="min-h-screen bg-background p-3 md:p-5 pb-20 md:pb-5" dir={dir}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3">
          <div className="w-full md:w-auto">
            <h1 className="text-xl md:text-3xl font-extrabold mb-1 md:mb-2">{t.dashboard.adminDashboard}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{t.auth.welcome}، {user.name}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            <div className="flex-1 md:flex-none min-w-[120px]">
              <LanguageSwitcher />
            </div>
            {onClearAllData && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1 md:flex-none min-h-[44px] px-3">
                    <Trash className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={18} weight="bold" />
                    <span className="text-sm">مسح البيانات</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir={dir}>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
                      <Trash size={24} className="text-destructive" weight="bold" />
                      تأكيد مسح البيانات
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base space-y-3 pt-2">
                      <p className="font-bold text-destructive">
                        ⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه!
                      </p>
                      <p>
                        سيتم حذف جميع البيانات التالية بشكل نهائي:
                      </p>
                      <ul className="list-disc list-inside space-y-2 pr-4 text-foreground">
                        <li>جميع سجلات الحضور والانصراف</li>
                        <li>سجلات السلف والمكافآت والخصومات (تصفير الأرصدة)</li>
                        <li>سجلات الإجازات والغياب</li>
                        <li>البلاغات السرية</li>
                        <li>سجلات المواقع الجغرافية</li>
                        <li>الإشعارات</li>
                      </ul>
                      <p className="font-bold text-green-600 pt-2">
                        ✓ سيتم الاحتفاظ بالبيانات التالية:
                      </p>
                      <ul className="list-disc list-inside space-y-1 pr-4 text-foreground">
                        <li>بيانات الموظفين وحساباتهم</li>
                        <li>إعدادات النظام وقواعد الخصم</li>
                        <li>السياج الجغرافي</li>
                      </ul>
                      <p className="text-sm text-muted-foreground pt-2">
                        هذا الإجراء مفيد عند بدء استخدام النظام فعلياً بعد فترة التجربة
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="min-h-[44px]">
                      إلغاء
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onClearAllData}
                      className="min-h-[44px] bg-destructive hover:bg-destructive/90"
                    >
                      <Trash className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={18} weight="bold" />
                      مسح جميع البيانات
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {onResetData && (
              <Button variant="outline" onClick={onResetData} className="flex-1 md:flex-none min-h-[44px] px-3">
                <Database className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={18} />
                <span className="text-sm">{t.actions.reset}</span>
              </Button>
            )}
            <Button variant="outline" onClick={onLogout} className="flex-1 md:flex-none min-h-[44px] px-3">
              <Power className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={18} />
              <span className="text-sm">{t.auth.logout}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-8">
          {adminModules.map((module) => {
            const Icon = module.icon
            return (
              <Card 
                key={module.id}
                className="hover:shadow-lg transition-all cursor-pointer group active:scale-95 border-2 hover:border-primary/20"
                onClick={() => onNavigate(module.id)}
              >
                <CardHeader className="p-3 md:p-6">
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg ${module.bgColor} flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform mx-auto`}>
                    <Icon className={module.color} size={20} weight="duotone" />
                  </div>
                  <CardTitle className="text-xs md:text-lg text-center leading-tight">{module.title}</CardTitle>
                  <CardDescription className="text-[10px] md:text-sm text-center hidden md:block">{module.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>

        <Card className="border-2">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">{t.stats.statistics}</CardTitle>
            <CardDescription className="text-xs md:text-sm">{t.app.systemName}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">{t.employee.totalEmployees}</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">25</p>
              </div>
              <div className="p-3 md:p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border-2 border-green-500/20">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">{t.attendance.presentCount}</p>
                <p className="text-2xl md:text-3xl font-bold text-green-600">23</p>
              </div>
              <div className="p-3 md:p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg border-2 border-red-500/20">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">{t.stats.totalDeductions}</p>
                <p className="text-2xl md:text-3xl font-bold text-red-600">145 ريال</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
