import { ReactNode } from 'react'
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh'
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator'
import { useLanguage } from '@/contexts/LanguageContext'
import { toast } from 'sonner'

interface AdminViewWrapperProps {
  children: ReactNode
  onRefresh?: () => void | Promise<void>
}

export function AdminViewWrapper({ children, onRefresh }: AdminViewWrapperProps) {
  const { t } = useLanguage()

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
    } else {
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    toast.success(t('messages.dataRefreshed'))
  }

  const { isRefreshing, pullDistance } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    enabled: true
  })

  const isTriggered = pullDistance >= 80

  return (
    <>
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        isTriggered={isTriggered}
        threshold={80}
      />
      {children}
    </>
  )
}
