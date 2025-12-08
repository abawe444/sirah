import type { Notification as AppNotification, NotificationPriority, NotificationTargetType, Center } from './types'

export function createNotification(
  title: string,
  message: string,
  priority: NotificationPriority,
  targetType: NotificationTargetType,
  createdBy: string,
  targetCenter?: Center,
  targetEmployeeIds?: number[]
): AppNotification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    message,
    priority,
    targetType,
    targetCenter,
    targetEmployeeIds,
    createdBy,
    createdAt: new Date().toISOString(),
    readBy: [],
    dismissedBy: []
  }
}

export function isNotificationForEmployee(notification: AppNotification, employeeId: number, employeeCenter?: Center): boolean {
  if (notification.targetType === 'all') {
    return true
  }
  
  if (notification.targetType === 'center' && notification.targetCenter && employeeCenter) {
    return notification.targetCenter === employeeCenter
  }
  
  if (notification.targetType === 'specific' && notification.targetEmployeeIds) {
    return notification.targetEmployeeIds.includes(employeeId)
  }
  
  return false
}

export function getUnreadNotificationsForEmployee(
  notifications: AppNotification[],
  employeeId: number,
  employeeCenter?: Center
): AppNotification[] {
  return notifications.filter(notif => 
    isNotificationForEmployee(notif, employeeId, employeeCenter) &&
    !notif.readBy.includes(employeeId) &&
    !notif.dismissedBy.includes(employeeId)
  ).sort((a, b) => {
    const priorityOrder = { urgent: 0, meeting: 1, attention: 2 }
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function markNotificationAsRead(notification: AppNotification, employeeId: number): AppNotification {
  if (!notification.readBy.includes(employeeId)) {
    return {
      ...notification,
      readBy: [...notification.readBy, employeeId]
    }
  }
  return notification
}

export function dismissNotification(notification: AppNotification, employeeId: number): AppNotification {
  if (!notification.dismissedBy.includes(employeeId)) {
    return {
      ...notification,
      dismissedBy: [...notification.dismissedBy, employeeId]
    }
  }
  return notification
}

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return Promise.resolve('denied')
  }
  
  return Notification.requestPermission()
}

export function sendBrowserNotification(title: string, body: string, priority: NotificationPriority) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const urgencyMap = {
      urgent: { badge: '🚨', requireInteraction: true, tag: 'urgent' },
      meeting: { badge: '📅', requireInteraction: false, tag: 'meeting' },
      attention: { badge: '⚠️', requireInteraction: false, tag: 'attention' }
    }
    
    const config = urgencyMap[priority]
    
    new Notification(title, {
      body,
      icon: '/logo.png',
      badge: config.badge,
      requireInteraction: config.requireInteraction,
      tag: config.tag
    })
  }
}
