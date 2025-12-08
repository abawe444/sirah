import { useEffect, useRef, useState } from 'react'

// تعريف واجهة الخيارات
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number
  resistance?: number
  enabled?: boolean
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  enabled = true,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  
  // استخدام useRef لتخزين القيم التي لا تحتاج لإعادة تصيير المكون عند تغييرها
  const touchStartY = useRef(0)
  const isPulling = useRef(false)
  // لتخزين معرف الانيميشن لإلغائه عند الحاجة ومنع التداخل
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      // نبدأ السحب فقط إذا كنا في أعلى الصفحة تماماً
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY
        isPulling.current = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return

      const currentY = e.touches[0].clientY
      // حساب المسافة بناءً على المقاومة
      const distance = (currentY - touchStartY.current) / resistance

      // إذا كانت المسافة أكبر من 0، فهذا يعني سحب للأسفل
      if (distance > 0) {
        // نمنع السكرول الطبيعي للمتصفح أثناء السحب لإنعاش الصفحة
        if (e.cancelable) e.preventDefault()

        // استخدام requestAnimationFrame لتحسين الأداء
        if (rafId.current) cancelAnimationFrame(rafId.current)
        
        rafId.current = requestAnimationFrame(() => {
          setPullDistance(distance)
        })
      } else {
        // إذا تحرك المستخدم للأعلى (سكرول عادي)، نلغي عملية السحب
        isPulling.current = false
        setPullDistance(0)
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling.current) return
      
      isPulling.current = false
      // إلغاء أي انيميشن معلق
      if (rafId.current) cancelAnimationFrame(rafId.current)

      if (pullDistance >= threshold) {
        setIsRefreshing(true)
        setPullDistance(threshold) // تثبيت المسافة عند الحد الأقصى أثناء التحميل
        
        try {
          await onRefresh()
        } catch (error) {
          console.error('Refresh error:', error)
        } finally {
          // تأخير بسيط لجمالية الحركة قبل إعادة الوضع الطبيعي
          setTimeout(() => {
            setIsRefreshing(false)
            setPullDistance(0)
          }, 500)
        }
      } else {
        // إذا لم يصل للحد المطلوب، ارجع للصفر
        setPullDistance(0)
      }
    }

    // إضافة المستمعين للأحداث
    // { passive: false } مهمة جداً لكي يعمل preventDefault في التاتش
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    // دالة التنظيف عند إلغاء المكون
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [enabled, onRefresh, resistance, threshold, pullDistance]) // تمت إضافة pullDistance للمصفوفة لضمان قراءة أحدث قيمة

  return { isRefreshing, pullDistance }
}