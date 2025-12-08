# Background Sync - دليل المزامنة التلقائية

## 📋 نظرة عامة

تم تفعيل ميزة Background Sync في نظام صرح الإتقان لضمان مزامنة البيانات تلقائياً حتى عند انقطاع الاتصال بالإنترنت.

## ✨ المميزات

### 1. المزامنة التلقائية
- **مزامنة فورية**: عند عودة الاتصال بالإنترنت، يتم مزامنة البيانات تلقائياً
- **مزامنة في الخلفية**: تعمل حتى لو كان التطبيق مغلقاً (على المتصفحات الداعمة)
- **قائمة انتظار ذكية**: يتم حفظ التغييرات في قائمة انتظار وم زامنتها بالترتيب

### 2. أنواع البيانات المدعومة
- ✅ سجلات الحضور
- ✅ السجلات اليومية
- ✅ تحديثات بيانات الموظفين
- ✅ التقارير
- ✅ حالة قراءة الإشعارات

### 3. مؤشرات الحالة
- 🟢 **متصل**: مزامنة نشطة
- 🔴 **غير متصل**: حفظ محلي فقط
- 🔄 **جاري المزامنة**: عملية المزامنة جارية
- ⏳ **في الانتظار**: عناصر تنتظر المزامنة

## 🔧 كيفية الاستخدام

### استخدام Hook للمزامنة

```typescript
import { useBackgroundSync } from '@/hooks/use-background-sync'

function MyComponent() {
  const { 
    isSyncing,        // حالة المزامنة
    pendingCount,     // عدد العناصر في الانتظار
    isOnline,         // حالة الاتصال
    addToSyncQueue,   // إضافة عنصر للمزامنة
    syncNow,          // مزامنة فورية
    clearSyncQueue,   // مسح قائمة الانتظار
    registerPeriodicSync // تفعيل المزامنة الدورية
  } = useBackgroundSync()

  // إضافة عنصر للمزامنة
  const handleSave = async () => {
    await addToSyncQueue({
      type: 'attendance-record',
      data: attendanceData
    })
  }

  // مزامنة فورية
  const handleManualSync = () => {
    syncNow()
  }

  return (
    <div>
      {!isOnline && <p>غير متصل - سيتم المزامنة عند عودة الاتصال</p>}
      {pendingCount > 0 && <p>عناصر في الانتظار: {pendingCount}</p>}
      <button onClick={handleManualSync} disabled={isSyncing}>
        {isSyncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
      </button>
    </div>
  )
}
```

### استخدام مكون المؤشر

```typescript
import { SyncStatusIndicator, SyncButton } from '@/components/SyncStatusIndicator'

function App() {
  return (
    <div>
      <SyncStatusIndicator />  {/* مؤشر الحالة العائم */}
      <SyncButton />           {/* زر المزامنة */}
    </div>
  )
}
```

## 📱 التوافقية

### المتصفحات الداعمة كاملاً
- ✅ Chrome/Edge 49+
- ✅ Opera 36+
- ✅ Samsung Internet 5.0+

### المتصفحات الداعمة جزئياً
- ⚠️ Firefox (مزامنة يدوية فقط)
- ⚠️ Safari (مزامنة يدوية فقط)

## 🔐 الأمان والخصوصية

- **تشفير البيانات**: جميع البيانات المحفوظة محلياً مخزنة في IndexedDB بشكل آمن
- **عدم فقدان البيانات**: حتى عند انقطاع الاتصال، لن تفقد أي تغييرات
- **التزامن الذكي**: يتم التحقق من تعارض البيانات قبل المزامنة

## 🚀 الميزات المتقدمة

### 1. المزامنة الدورية (Periodic Sync)
على المتصفحات الداعمة، يمكن تفعيل المزامنة التلقائية كل ساعة:

```typescript
const { registerPeriodicSync } = useBackgroundSync()

useEffect(() => {
  registerPeriodicSync()
}, [])
```

### 2. معالجة الأحداث المخصصة

```typescript
useEffect(() => {
  const handleSyncEvent = (event: CustomEvent) => {
    console.log('تمت مزامنة:', event.detail)
  }

  window.addEventListener('sync-data', handleSyncEvent)
  
  return () => {
    window.removeEventListener('sync-data', handleSyncEvent)
  }
}, [])
```

## 📊 مراقبة الأداء

### عرض حالة المزامنة

```typescript
const { pendingCount, isSyncing, isOnline } = useBackgroundSync()

console.log({
  'عناصر في الانتظار': pendingCount,
  'جاري المزامنة': isSyncing,
  'حالة الاتصال': isOnline ? 'متصل' : 'غير متصل'
})
```

## 🐛 استكشاف الأخطاء

### المشكلة: المزامنة لا تعمل تلقائياً
**الحل**:
1. تحقق من دعم المتصفح للـ Background Sync
2. تأكد من تسجيل Service Worker بنجاح
3. استخدم المزامنة اليدوية كبديل

### المشكلة: البيانات لا تُحفظ في وضع عدم الاتصال
**الحل**:
1. تحقق من استخدام `addToSyncQueue` بشكل صحيح
2. تأكد من تمرير نوع البيانات الصحيح
3. راجع console logs للأخطاء

### المشكلة: قائمة الانتظار تزداد بشكل كبير
**الحل**:
```typescript
const { clearSyncQueue } = useBackgroundSync()

// مسح قائمة الانتظار (استخدم بحذر!)
await clearSyncQueue()
```

## 📝 أمثلة عملية

### مثال 1: حفظ سجل حضور
```typescript
const handleCheckIn = async (employeeId: number) => {
  const record = {
    employeeId,
    timestamp: new Date().toISOString(),
    location: currentLocation
  }

  await addToSyncQueue({
    type: 'attendance-record',
    data: record
  })

  toast.success('تم تسجيل الحضور - سيتم المزامنة تلقائياً')
}
```

### مثال 2: تحديث بيانات موظف
```typescript
const handleUpdateEmployee = async (employee: Employee) => {
  await addToSyncQueue({
    type: 'employee-update',
    data: employee
  })

  if (!isOnline) {
    toast.warning('تم الحفظ محلياً - سيتم المزامنة عند عودة الاتصال')
  }
}
```

### مثال 3: إرسال تقرير
```typescript
const handleSubmitReport = async (report: Report) => {
  await addToSyncQueue({
    type: 'report',
    data: report
  })

  // مزامنة فورية إذا كان متصلاً
  if (isOnline) {
    await syncNow()
  }
}
```

## 🔮 المستقبل

### ميزات قادمة:
- [ ] ضغط البيانات قبل المزامنة
- [ ] أولوية المزامنة (عاجل، عادي، منخفض)
- [ ] إحصائيات تفصيلية للمزامنة
- [ ] تصدير/استيراد قائمة الانتظار
- [ ] مزامنة تصاعدية للبيانات الكبيرة

## 💡 نصائح للمطورين

1. **استخدم المزامنة بحكمة**: لا تضف كل شيء لقائمة الانتظار
2. **تجنب البيانات الكبيرة**: ضغط الملفات الكبيرة قبل المزامنة
3. **اختبر وضع عدم الاتصال**: استخدم Chrome DevTools > Network > Offline
4. **راقب حجم IndexedDB**: امسح البيانات القديمة بانتظام
5. **وفر تجربة مستخدم واضحة**: أخبر المستخدم دائماً بحالة المزامنة

## 📞 الدعم

للأسئلة والمساعدة:
- راجع الكود في `/src/hooks/use-background-sync.ts`
- راجع Service Worker في `/public/service-worker.js`
- راجع المكونات في `/src/components/SyncStatusIndicator.tsx`

---

**ملاحظة**: هذه الميزة جزء من تطبيق PWA المتقدم لنظام صرح الإتقان، وتعمل جنباً إلى جنب مع ميزات أخرى مثل التخزين المؤقت والإشعارات.
