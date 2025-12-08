import { Button } from '@/components/ui/button'
import { Calendar, ChartBar, CurrencyDollar, Airplane, CurrencyCircleDollar } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'

interface NavigationProps {
  currentView: 'daily' | 'history' | 'payroll' | 'leave' | 'advances'
  onViewChange: (view: 'daily' | 'history' | 'payroll' | 'leave' | 'advances') => void
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { t, dir } = useLanguage()
  
  const navItems = [
    { id: 'daily' as const, icon: Calendar, label: t('navigation.daily') },
    { id: 'history' as const, icon: ChartBar, label: t('navigation.history') },
    { id: 'payroll' as const, icon: CurrencyDollar, label: t('navigation.payroll') },
    { id: 'advances' as const, icon: CurrencyCircleDollar, label: t('navigation.advances') },
    { id: 'leave' as const, icon: Airplane, label: t('navigation.leave') }
  ]

  return (
    <>
      <div className="hidden md:flex flex-wrap gap-2 mb-6 no-print">
        {navItems.map(item => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              variant={currentView === item.id ? 'default' : 'outline'}
              className="flex-1 md:flex-none font-bold min-h-[44px]"
            >
              <Icon size={20} weight="bold" className={dir === 'rtl' ? 'ml-2' : 'mr-2'} />
              {item.label}
            </Button>
          )
        })}
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 no-print safe-area-bottom">
        <div className="grid grid-cols-5 gap-0">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 min-h-[64px] transition-colors ${
                  isActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
                <span className="text-[10px] font-bold mt-1 leading-tight text-center">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      
      <div className="md:hidden h-[64px]"></div>
    </>
  )
}
