import { useEffect, useCallback, useState } from 'react'
import { toast } from 'sonner'

interface SyncItem {
  id: string
  type: 'attendance-record' | 'daily-record' | 'employee-update' | 'report' | 'notification-read'
  data: unknown
  timestamp: number
}

export function useBackgroundSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('تم الاتصال بالإنترنت - سيتم مزامنة البيانات')
      syncNow()
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('لا توجد اتصال بالإنترنت - سيتم حفظ التغييرات محلياً')
    }

    const handleSyncMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_SUCCESS') {
        toast.success(`تمت مزامنة ${event.data.count} عنصر بنجاح`)
        updatePendingCount()
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    navigator.serviceWorker?.addEventListener('message', handleSyncMessage)

    updatePendingCount()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      navigator.serviceWorker?.removeEventListener('message', handleSyncMessage)
    }
  }, [])

  const updatePendingCount = useCallback(async () => {
    try {
      const queue = (await getFromIndexedDB('sync-queue') || []) as SyncItem[]
      setPendingCount(queue.length)
    } catch (error) {
      console.error('Failed to get pending count:', error)
    }
  }, [])

  const addToSyncQueue = useCallback(async (item: Omit<SyncItem, 'id' | 'timestamp'>) => {
    try {
      const syncItem: SyncItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now()
      }

      const queue = (await getFromIndexedDB('sync-queue') || []) as SyncItem[]
      queue.push(syncItem)
      await saveToIndexedDB('sync-queue', queue)
      
      setPendingCount(queue.length)

      if (navigator.onLine && 'serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        try {
          const registration = await navigator.serviceWorker.ready
          await (registration as any).sync.register(`sync-${item.type}`)
          console.log('Background sync registered for', item.type)
        } catch (error) {
          console.warn('Background sync registration failed, will sync manually:', error)
          await syncNow()
        }
      }
    } catch (error) {
      console.error('Failed to add to sync queue:', error)
      toast.error('فشل حفظ البيانات للمزامنة')
    }
  }, [])

  const syncNow = useCallback(async () => {
    if (isSyncing || !navigator.onLine) {
      return
    }

    setIsSyncing(true)

    try {
      const queue = (await getFromIndexedDB('sync-queue') || []) as SyncItem[]
      
      if (queue.length === 0) {
        setIsSyncing(false)
        return
      }

      const successfulSyncs: string[] = []

      for (const item of queue) {
        try {
          await processSyncItem(item)
          successfulSyncs.push(item.id)
        } catch (error) {
          console.error('Failed to sync item:', error)
        }
      }

      const remainingQueue = queue.filter((item: SyncItem) => !successfulSyncs.includes(item.id))
      await saveToIndexedDB('sync-queue', remainingQueue)
      setPendingCount(remainingQueue.length)

      if (successfulSyncs.length > 0) {
        toast.success(`تمت مزامنة ${successfulSyncs.length} عنصر`)
      }
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('فشلت المزامنة')
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing])

  const clearSyncQueue = useCallback(async () => {
    try {
      await saveToIndexedDB('sync-queue', [])
      setPendingCount(0)
      toast.success('تم مسح قائمة الانتظار')
    } catch (error) {
      console.error('Failed to clear sync queue:', error)
      toast.error('فشل مسح قائمة الانتظار')
    }
  }, [])

  const registerPeriodicSync = useCallback(async () => {
    if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        const status = await (navigator.permissions as any).query({
          name: 'periodic-background-sync'
        })

        if (status.state === 'granted') {
          await (registration as any).periodicSync.register('periodic-data-sync', {
            minInterval: 60 * 60 * 1000
          })
          console.log('Periodic sync registered')
          toast.success('تم تفعيل المزامنة التلقائية')
        }
      } catch (error) {
        console.warn('Periodic sync not available:', error)
      }
    }
  }, [])

  return {
    isSyncing,
    pendingCount,
    isOnline,
    addToSyncQueue,
    syncNow,
    clearSyncQueue,
    registerPeriodicSync
  }
}

async function processSyncItem(item: SyncItem) {
  console.log('Processing sync item:', item.type)
  
  window.dispatchEvent(new CustomEvent('sync-data', {
    detail: {
      type: item.type,
      data: item.data
    }
  }))
}

async function getFromIndexedDB(key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SyncDatabase', 1)
    
    request.onerror = () => reject(request.error)
    
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('syncStore')) {
        resolve(null)
        return
      }
      
      const transaction = db.transaction(['syncStore'], 'readonly')
      const store = transaction.objectStore('syncStore')
      const getRequest = store.get(key)
      
      getRequest.onsuccess = () => resolve(getRequest.result?.value)
      getRequest.onerror = () => reject(getRequest.error)
    }
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('syncStore')) {
        db.createObjectStore('syncStore', { keyPath: 'key' })
      }
    }
  })
}

async function saveToIndexedDB(key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SyncDatabase', 1)
    
    request.onerror = () => reject(request.error)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['syncStore'], 'readwrite')
      const store = transaction.objectStore('syncStore')
      const putRequest = store.put({ key, value })
      
      putRequest.onsuccess = () => resolve()
      putRequest.onerror = () => reject(putRequest.error)
    }
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('syncStore')) {
        db.createObjectStore('syncStore', { keyPath: 'key' })
      }
    }
  })
}
