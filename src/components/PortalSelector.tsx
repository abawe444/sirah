import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, UserCircle } from '@phosphor-icons/react'
import { UserRole } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface PortalSelectorProps {
  onSelectPortal: (role: UserRole) => void
}

export function PortalSelector({ onSelectPortal }: PortalSelectorProps) {
  // t هنا هو كائن الترجمة الكامل بناءً على التعديل السابق
  const { t } = useLanguage()

  const portalTexts = {
    adminTitle: t?.auth?.adminPortal ?? 'بوابة المسؤول',
    adminDescription:
      t?.dashboard?.adminDashboard ?? 'لوحة التحكم الإدارية الكاملة',
    employeeTitle: t?.auth?.employeePortal ?? 'بوابة الموظف',
    employeeDescription:
      t?.dashboard?.employeeDashboard ?? t?.app?.subtitle ?? 'منصة الموظفين اليومية',
    appTitle: t?.app?.title ?? 'نظام صرح الإتقان المتكامل',
    selectPortal: t?.auth?.selectPortal ?? 'اختر البوابة المناسبة للدخول',
    loginLabel: t?.auth?.login ?? 'تسجيل الدخول'
  }

  const portals = [
    {
      role: 'admin' as UserRole,
      title: portalTexts.adminTitle,
      description: portalTexts.adminDescription,
      icon: Shield,
      gradient: 'from-primary/20 to-primary/5'
    },
    {
      role: 'employee' as UserRole,
      title: portalTexts.employeeTitle,
      // تم استخدام subtitle لأن employeeDashboard غير موجود في تعريف الواجهة السابق
      description: portalTexts.employeeDescription,
      icon: UserCircle,
      gradient: 'from-accent/20 to-accent/5'
    }
  ]

  return (
    // إضافة relative للحاوية لضبط تموضع زر اللغة
    <div className="w-full max-w-4xl px-4 relative">
      <div className="absolute top-0 right-0 md:top-5 md:left-5 z-10">
        <LanguageSwitcher />
      </div>
      
      <div className="text-center mb-6 md:mb-8 pt-12 md:pt-0">
        <h1 className="text-2xl md:text-4xl font-extrabold mb-2">{portalTexts.appTitle}</h1>
        <p className="text-muted-foreground text-sm md:text-lg">{portalTexts.selectPortal}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {portals.map((portal) => {
          const Icon = portal.icon
          return (
            <Card 
              key={portal.role}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group active:scale-95 border-2 hover:border-primary/20"
              onClick={() => onSelectPortal(portal.role)}
              data-testid={`portal-card-${portal.role}`}
            >
              <CardHeader className="text-center pb-3 p-4 md:p-6">
                <div className={`mx-auto p-4 md:p-6 bg-gradient-to-br ${portal.gradient} rounded-2xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={48} weight="duotone" className="text-primary md:w-16 md:h-16" />
                </div>
                <CardTitle className="text-xl md:text-2xl">{portal.title}</CardTitle>
                <CardDescription className="text-sm md:text-base">{portal.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <Button 
                  className="w-full min-h-[48px]" 
                  size="lg"
                  data-testid={`portal-btn-${portal.role}`}
                  onClick={(e) => {
                    // منع انتشار الحدث حتى لا يتم استدعاء onSelectPortal مرتين
                    e.stopPropagation();
                    onSelectPortal(portal.role);
                  }}
                >
                  {portalTexts.loginLabel}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}