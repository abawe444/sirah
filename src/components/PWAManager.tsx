import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Download, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'

export function PWAManager() {
  const { t } = useLanguage()
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      setSwRegistration(registration)

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
              toast.info('يوجد تحديث جديد للتطبيق', {
                action: {
                  label: 'تحديث',
                  onClick: () => updateServiceWorker()
                },
                duration: 10000
              })
            }
          })
        }
      })

      await registration.update()

      console.log('[PWA] Service Worker registered successfully')
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error)
    }
  }

  const updateServiceWorker = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('المتصفح لا يدعم الإشعارات')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === 'granted') {
        toast.success('تم تفعيل الإشعارات بنجاح')
        
        if (swRegistration) {
          await subscribeToPushNotifications()
        }
      } else if (permission === 'denied') {
        toast.error('تم رفض إذن الإشعارات')
      }
    } catch (error) {
      console.error('[PWA] Notification permission error:', error)
      toast.error('حدث خطأ في طلب إذن الإشعارات')
    }
  }

  const subscribeToPushNotifications = async () => {
    if (!swRegistration) return

    try {
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8YN2aTqKk3z-RL5vYCQrFR0f9WNHKV3a_aD5kMeNRwLB7jBTqCx'
        )
      })

      console.log('[PWA] Push subscription:', JSON.stringify(subscription))
      
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const sendTestNotification = async () => {
    if (notificationPermission !== 'granted') {
      toast.error('يجب تفعيل الإشعارات أولاً')
      return
    }

    if (!swRegistration) {
      toast.error('Service Worker غير مسجل')
      return
    }

    try {
      await swRegistration.showNotification('صرح الإتقان', {
        body: 'هذه رسالة تجريبية للإشعارات',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: 'test-notification',
        requireInteraction: false,
        dir: 'rtl',
        lang: 'ar'
      })

      toast.success('تم إرسال إشعار تجريبي')
    } catch (error) {
      console.error('[PWA] Test notification failed:', error)
      toast.error('فشل إرسال الإشعار التجريبي')
    }
  }

  const clearCache = async () => {
    if (!swRegistration) return

    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
      
      swRegistration.active?.postMessage({ type: 'CLEAR_CACHE' })
      
      toast.success('تم مسح الذاكرة المؤقتة بنجاح')
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('[PWA] Clear cache failed:', error)
      toast.error('فشل مسح الذاكرة المؤقتة')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            إدارة الإشعارات
          </CardTitle>
          <CardDescription>
            تفعيل وإدارة الإشعارات الفورية للتطبيق
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="font-semibold">حالة الإشعارات</div>
              <div className="text-sm text-muted-foreground">
                {notificationPermission === 'granted' && '✓ مفعّلة'}
                {notificationPermission === 'denied' && '✗ محظورة'}
                {notificationPermission === 'default' && '○ غير مفعّلة'}
              </div>
            </div>
            {notificationPermission === 'granted' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={sendTestNotification}
                className="gap-2"
              >
                <Bell className="w-4 h-4" />
                إرسال إشعار تجريبي
              </Button>
            ) : (
              <Button
                onClick={requestNotificationPermission}
                size="sm"
                className="gap-2"
              >
                <Bell className="w-4 h-4" />
                تفعيل الإشعارات
              </Button>
            )}
          </div>

          {notificationPermission === 'denied' && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              <div className="font-semibold mb-1">تم حظر الإشعارات</div>
              <div>
                يرجى تفعيل الإشعارات من إعدادات المتصفح للموقع
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            حالة التطبيق
          </CardTitle>
          <CardDescription>
            معلومات وإدارة تطبيق الويب التقدمي (PWA)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">حالة الاتصال</span>
              <span className={`text-sm font-semibold ${isOnline ? 'text-success' : 'text-destructive'}`}>
                {isOnline ? '✓ متصل' : '✗ غير متصل'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Service Worker</span>
              <span className={`text-sm font-semibold ${swRegistration ? 'text-success' : 'text-muted-foreground'}`}>
                {swRegistration ? '✓ مسجل' : '○ غير مسجل'}
              </span>
            </div>

            {updateAvailable && (
              <div className="p-4 bg-primary/10 text-primary rounded-lg">
                <div className="font-semibold mb-2">تحديث جديد متوفر</div>
                <Button
                  onClick={updateServiceWorker}
                  size="sm"
                  className="gap-2"
                >
                  <ArrowsClockwise className="w-4 h-4" />
                  تحديث الآن
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={clearCache}
              className="w-full gap-2"
            >
              <ArrowsClockwise className="w-4 h-4" />
              مسح الذاكرة المؤقتة وإعادة التحميل
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
