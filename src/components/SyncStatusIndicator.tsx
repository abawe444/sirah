import { useBackgroundSync } from '@/hooks/use-background-sync'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { CloudArrowUp, CloudSlash, CloudCheck, ArrowsClockwise } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

export function SyncStatusIndicator() {
  const { isSyncing, pendingCount, isOnline, syncNow } = useBackgroundSync()
  const { t } = useLanguage()

  if (!isOnline) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-warning/10 border border-warning/30 rounded-full px-4 py-2 flex items-center gap-2 text-warning shadow-lg backdrop-blur-sm"
      >
        <CloudSlash weight="fill" className="w-5 h-5" />
        <span className="text-sm font-semibold">{t('sync.offline')}</span>
        {pendingCount > 0 && (
          <span className="bg-warning text-warning-foreground rounded-full px-2 py-0.5 text-xs font-bold">
            {pendingCount}
          </span>
        )}
      </motion.div>
    )
  }

  if (isSyncing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 flex items-center gap-2 text-primary shadow-lg backdrop-blur-sm"
      >
        <ArrowsClockwise weight="bold" className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">{t('sync.syncing')}</span>
      </motion.div>
    )
  }

  if (pendingCount > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <Button
          onClick={syncNow}
          variant="outline"
          size="sm"
          className="bg-background/95 border-primary/30 hover:bg-primary/10 shadow-lg backdrop-blur-sm"
        >
          <CloudArrowUp weight="bold" className="w-4 h-4" />
          <span>{t('sync.pending')}</span>
          <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-bold">
            {pendingCount}
          </span>
        </Button>
      </motion.div>
    )
  }

  return null
}

export function SyncButton() {
  const { isSyncing, isOnline, syncNow, pendingCount } = useBackgroundSync()
  const { t } = useLanguage()

  return (
    <Button
      onClick={syncNow}
      disabled={isSyncing || !isOnline}
      variant="ghost"
      size="sm"
      className="relative"
    >
      <AnimatePresence mode="wait">
        {isSyncing ? (
          <motion.div
            key="syncing"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 180 }}
          >
            <ArrowsClockwise weight="bold" className="w-5 h-5 animate-spin" />
          </motion.div>
        ) : isOnline ? (
          <motion.div
            key="online"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <CloudCheck weight="fill" className="w-5 h-5 text-success" />
          </motion.div>
        ) : (
          <motion.div
            key="offline"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <CloudSlash weight="fill" className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {pendingCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
        >
          {pendingCount > 9 ? '9+' : pendingCount}
        </motion.span>
      )}
    </Button>
  )
}
