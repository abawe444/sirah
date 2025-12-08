import { useState, useEffect } from 'react'
import { Bell } from '@phosphor-icons/react'
import { useLanguage } from '../contexts/LanguageContext'

export function NotificationManager() {
  const { t } = useLanguage()
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        // Show a test notification
        new Notification('صرح الإتقان', {
          body: 'تم تفعيل الإشعارات بنجاح!',
          icon: '/icons/icon-192x192.png'
        })
      }
    }
  }

  if (permission === 'granted') {
    return (
      <div className="fixed bottom-4 left-4 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg">
        <Bell size={20} />
      </div>
    )
  }

  return (
    <button
      onClick={requestPermission}
      className="fixed bottom-4 left-4 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
      title={t('notifications.enable')}
    >
      <Bell size={20} />
    </button>
  )
}