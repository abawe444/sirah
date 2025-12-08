# Background Sync Integration Examples

## Example 1: Integration with DailyView

Here's how to integrate Background Sync with the daily attendance view:

```typescript
// src/components/DailyView.tsx
import { useBackgroundSync } from '@/hooks/use-background-sync'
import { useLanguage } from '@/contexts/LanguageContext'
import { toast } from 'sonner'

export function DailyView({ 
  employees, 
  onSaveToday,
  // ... other props
}) {
  const { t } = useLanguage()
  const { addToSyncQueue, isOnline } = useBackgroundSync()
  
  const handleSaveTodayWithSync = async () => {
    const todayDate = getTodayDate()
    const record = saveDailyRecord(employees)
    
    // Save locally using existing method
    onSaveToday()
    
    // Add to sync queue for background sync
    await addToSyncQueue({
      type: 'daily-record',
      data: {
        date: todayDate,
        record: record
      }
    })
    
    // Show appropriate message
    if (isOnline) {
      toast.success(`${t('actions.save')} ${todayDate}`)
    } else {
      toast.warning(`${t('actions.save')} ${todayDate} - ${t('sync.pending')}`)
    }
  }
  
  return (
    <div>
      {/* ... existing JSX ... */}
      <button onClick={handleSaveTodayWithSync}>
        {t('actions.save')}
      </button>
    </div>
  )
}
```

## Example 2: Integration with Employee Updates

```typescript
// src/components/AdminSettingsView.tsx
import { useBackgroundSync } from '@/hooks/use-background-sync'

export function AdminSettingsView({
  employees,
  onUpdateEmployee
}) {
  const { addToSyncQueue, isOnline } = useBackgroundSync()
  
  const handleUpdateEmployeeWithSync = async (
    employeeId: number, 
    updates: Partial<Employee>
  ) => {
    // Update locally
    onUpdateEmployee(employeeId, updates)
    
    // Add to sync queue
    await addToSyncQueue({
      type: 'employee-update',
      data: {
        employeeId,
        updates,
        timestamp: new Date().toISOString()
      }
    })
    
    if (!isOnline) {
      toast.warning('تم الحفظ محلياً - سيتم المزامنة عند عودة الاتصال')
    }
  }
  
  return (
    // ... JSX with update handlers
  )
}
```

## Example 3: Integration with Anonymous Reports

```typescript
// src/components/AnonymousReportForm.tsx
import { useBackgroundSync } from '@/hooks/use-background-sync'

export function AnonymousReportForm() {
  const { addToSyncQueue, isOnline, syncNow } = useBackgroundSync()
  const [submitting, setSubmitting] = useState(false)
  
  const handleSubmit = async (reportData) => {
    setSubmitting(true)
    
    try {
      // Add to sync queue
      await addToSyncQueue({
        type: 'report',
        data: {
          ...reportData,
          submittedAt: new Date().toISOString()
        }
      })
      
      // Try immediate sync if online
      if (isOnline) {
        await syncNow()
      }
      
      toast.success(
        isOnline 
          ? 'تم إرسال البلاغ بنجاح'
          : 'تم حفظ البلاغ - سيتم إرساله عند عودة الاتصال'
      )
      
      // Reset form
      resetForm()
    } catch (error) {
      toast.error('فشل حفظ البلاغ')
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... form fields ... */}
      <button type="submit" disabled={submitting}>
        {submitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
      </button>
    </form>
  )
}
```

## Example 4: Integration with Notification Status

```typescript
// src/components/NotificationManagementView.tsx
import { useBackgroundSync } from '@/hooks/use-background-sync'

export function NotificationManagementView() {
  const { addToSyncQueue } = useBackgroundSync()
  
  const handleMarkAsRead = async (notificationId: string) => {
    // Update UI immediately
    updateNotificationReadStatus(notificationId)
    
    // Queue for background sync
    await addToSyncQueue({
      type: 'notification-read',
      data: {
        notificationId,
        readAt: new Date().toISOString()
      }
    })
  }
  
  return (
    // ... notifications list
  )
}
```

## Example 5: Full App.tsx Integration

```typescript
// src/App.tsx
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator'
import { useBackgroundSync } from '@/hooks/use-background-sync'
import { useEffect } from 'react'

function App() {
  const { registerPeriodicSync } = useBackgroundSync()
  
  // Register periodic sync on app load
  useEffect(() => {
    registerPeriodicSync()
      .then(() => console.log('Periodic sync registered'))
      .catch(err => console.log('Periodic sync not available:', err))
  }, [registerPeriodicSync])
  
  return (
    <LanguageProvider>
      <SyncStatusIndicator />
      <AppContent />
      <InstallPrompt />
    </LanguageProvider>
  )
}

export default App
```

## Example 6: Listen to Sync Events

```typescript
// Custom hook for sync event handling
import { useEffect } from 'react'
import { useBackgroundSync } from '@/hooks/use-background-sync'

export function useSyncEventHandler() {
  const { syncNow } = useBackgroundSync()
  
  useEffect(() => {
    const handleSyncEvent = (event: CustomEvent) => {
      const { type, data } = event.detail
      
      console.log('Sync event received:', type, data)
      
      // Handle different sync types
      switch (type) {
        case 'attendance-record':
          // Update attendance UI
          break
        case 'daily-record':
          // Update daily records UI
          break
        case 'employee-update':
          // Update employee data UI
          break
        // ... handle other types
      }
    }
    
    window.addEventListener('sync-data', handleSyncEvent as EventListener)
    
    return () => {
      window.removeEventListener('sync-data', handleSyncEvent as EventListener)
    }
  }, [])
}

// Usage in component
function MyComponent() {
  useSyncEventHandler()
  
  return <div>My Component</div>
}
```

## Example 7: Advanced Queue Management

```typescript
import { useBackgroundSync } from '@/hooks/use-background-sync'

export function SyncManager() {
  const { 
    pendingCount, 
    syncNow, 
    clearSyncQueue, 
    isSyncing 
  } = useBackgroundSync()
  
  const handleForceSync = async () => {
    if (confirm('مزامنة جميع البيانات المعلقة؟')) {
      await syncNow()
    }
  }
  
  const handleClearQueue = async () => {
    if (confirm('حذف جميع البيانات المعلقة؟ (لا يمكن التراجع)')) {
      await clearSyncQueue()
      toast.success('تم مسح قائمة الانتظار')
    }
  }
  
  return (
    <div className="sync-manager">
      <h3>إدارة المزامنة</h3>
      <p>عناصر في الانتظار: {pendingCount}</p>
      
      <button onClick={handleForceSync} disabled={isSyncing}>
        {isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
      </button>
      
      <button 
        onClick={handleClearQueue} 
        disabled={pendingCount === 0}
        className="danger"
      >
        مسح قائمة الانتظار
      </button>
    </div>
  )
}
```

## Best Practices

### 1. Always provide user feedback
```typescript
if (!isOnline) {
  toast.warning('سيتم المزامنة عند عودة الاتصال')
} else {
  toast.success('تمت المزامنة بنجاح')
}
```

### 2. Handle errors gracefully
```typescript
try {
  await addToSyncQueue({ type, data })
} catch (error) {
  console.error('Sync queue error:', error)
  toast.error('فشل حفظ البيانات للمزامنة')
}
```

### 3. Keep queue size manageable
```typescript
if (pendingCount > 100) {
  toast.warning('قائمة المزامنة كبيرة جداً - يُنصح بالمزامنة')
}
```

### 4. Provide manual sync option
```typescript
<button onClick={syncNow}>
  مزامنة يدوية
</button>
```

### 5. Show sync status in critical operations
```typescript
{isSyncing && (
  <div className="sync-in-progress">
    جاري مزامنة البيانات...
  </div>
)}
```

## Testing Offline Mode

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from dropdown
4. Test your offline functionality

### Programmatic Testing
```typescript
// Simulate offline
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: false
})

// Trigger offline event
window.dispatchEvent(new Event('offline'))

// ... test offline functionality ...

// Restore online
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
})

window.dispatchEvent(new Event('online'))
```

---

These examples show how to integrate Background Sync throughout your application while maintaining a consistent user experience.
