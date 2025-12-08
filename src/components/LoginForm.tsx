import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Shield, LockKey } from '@phosphor-icons/react'
import { UserRole } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface LoginFormProps {
  role: UserRole
  onLogin: (username: string, password: string) => void
  error?: string
}

export function LoginForm({ role, onLogin, error }: LoginFormProps) {
  const { t } = useLanguage()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const roleConfig = {
    admin: {
      title: t('auth.adminPortal'),
      description: t('dashboard.adminDashboard'),
      icon: Shield,
      color: 'text-primary'
    },
    employee: {
      title: t('auth.employeePortal'),
      description: t('dashboard.employeeDashboard'),
      icon: LockKey,
      color: 'text-accent-foreground'
    }
  }
  
  const config = roleConfig[role]
  const Icon = config.icon

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(username, password)
  }

  return (
    <Card className="w-full max-w-md mx-4">
      <div className="absolute top-3 md:top-5 left-3 md:left-5 z-10">
        <LanguageSwitcher />
      </div>
      
      <CardHeader className="text-center p-4 md:p-6">
        <div className="flex justify-center mb-3 md:mb-4">
          <div className={`p-3 md:p-4 bg-muted rounded-full ${config.color}`}>
            <Icon size={40} weight="duotone" className="md:w-12 md:h-12" />
          </div>
        </div>
        <CardTitle className="text-xl md:text-2xl">{config.title}</CardTitle>
        <CardDescription className="text-sm md:text-base">{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm md:text-base">{t('auth.username')}</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.username')}
              required
              autoComplete="username"
              className="min-h-[48px] text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm md:text-base">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.password')}
              required
              autoComplete="current-password"
              className="min-h-[48px] text-base"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full min-h-[52px] text-base md:text-lg" size="lg">
            {t('auth.login')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
