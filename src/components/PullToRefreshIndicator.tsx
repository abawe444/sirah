import { ArrowClockwise } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'

interface PullToRefreshIndicatorProps {
  pullDistance: number
  isRefreshing: boolean
  isTriggered: boolean
  threshold: number
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  isTriggered,
  threshold
}: PullToRefreshIndicatorProps) {
  const { t, dir } = useLanguage()
  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 360

  return (
    <AnimatePresence>
      {pullDistance > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            transform: `translateY(${pullDistance}px)`,
            position: 'fixed',
            top: 0,
            left: '50%',
            marginLeft: '-20px',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              transition-colors duration-200
              ${isTriggered ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
            `}
            style={{
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <ArrowClockwise
              size={24}
              weight="bold"
              style={{
                transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
                transition: 'transform 0.1s ease-out'
              }}
              className={isRefreshing ? 'animate-spin' : ''}
            />
          </div>
          
          {isTriggered && !isRefreshing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-semibold text-primary bg-card px-3 py-1 rounded-full shadow-sm whitespace-nowrap"
            >
              {dir === 'rtl' ? 'اترك للتحديث' : 'Release to refresh'}
            </motion.div>
          )}

          {isRefreshing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-semibold text-primary bg-card px-3 py-1 rounded-full shadow-sm whitespace-nowrap"
            >
              {dir === 'rtl' ? 'جاري التحديث...' : 'Refreshing...'}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
