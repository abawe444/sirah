import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { GeofenceSettings, GeolocationCoordinates } from '@/lib/types'

interface UseGeofenceNotificationsProps {
  settings: GeofenceSettings
  userCenter?: string
  enabled?: boolean
}

interface GeofenceState {
  isInside: boolean
  lastNotificationTime: number
  lastKnownPosition: GeolocationCoordinates | null
}

const NOTIFICATION_COOLDOWN = 60000
const POSITION_CHECK_INTERVAL = 10000

export function useGeofenceNotifications({ 
  settings, 
  userCenter,
  enabled = true 
}: UseGeofenceNotificationsProps) {
  const [geofenceState, setGeofenceState] = useState<GeofenceState>({
    isInside: false,
    lastNotificationTime: 0,
    lastKnownPosition: null
  })
  
  const watchIdRef = useRef<number | null>(null)
  const stateRef = useRef<GeofenceState>(geofenceState)

  useEffect(() => {
    stateRef.current = geofenceState
  }, [geofenceState])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const checkIfInsideGeofence = (coords: GeolocationCoordinates): boolean => {
    if (!settings.enabled) return true

    if (userCenter && settings.allowedCenters[userCenter]) {
      const centerData = settings.allowedCenters[userCenter]
      const distance = calculateDistance(
        coords.latitude,
        coords.longitude,
        centerData.latitude,
        centerData.longitude
      )
      return distance <= centerData.radius
    }

    const distance = calculateDistance(
      coords.latitude,
      coords.longitude,
      settings.centerLatitude,
      settings.centerLongitude
    )
    return distance <= settings.radiusInMeters
  }

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  const showNotification = async (title: string, body: string, isInside: boolean) => {
    const hasPermission = await requestNotificationPermission()

    if (hasPermission) {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: 'geofence-notification',
          requireInteraction: false,
          silent: false
        })

        setTimeout(() => notification.close(), 5000)
      } catch (error) {
        console.log('Notification API not available, using toast')
      }
    }

    toast(title, {
      description: body,
      duration: 5000,
      icon: isInside ? '✅' : '⚠️',
      style: {
        background: isInside ? '#10b981' : '#ef4444',
        color: 'white',
        border: 'none',
        fontWeight: '700',
        fontSize: '15px',
        fontFamily: 'Cairo, sans-serif'
      }
    })
  }

  const handlePositionChange = (position: GeolocationPosition) => {
    const coords: GeolocationCoordinates = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    }

    const currentState = stateRef.current
    const isCurrentlyInside = checkIfInsideGeofence(coords)
    const now = Date.now()

    const shouldNotify = 
      currentState.lastKnownPosition !== null &&
      currentState.isInside !== isCurrentlyInside &&
      (now - currentState.lastNotificationTime) > NOTIFICATION_COOLDOWN

    if (shouldNotify) {
      if (isCurrentlyInside) {
        showNotification(
          '🎉 دخلت منطقة العمل',
          'أنت الآن داخل السياج الجغرافي. يمكنك تسجيل الحضور.',
          true
        )
      } else {
        showNotification(
          '⚠️ خرجت من منطقة العمل',
          'أنت الآن خارج السياج الجغرافي. لا يمكنك تسجيل الحضور.',
          false
        )
      }

      setGeofenceState({
        isInside: isCurrentlyInside,
        lastNotificationTime: now,
        lastKnownPosition: coords
      })
    } else if (currentState.lastKnownPosition === null) {
      setGeofenceState({
        isInside: isCurrentlyInside,
        lastNotificationTime: now,
        lastKnownPosition: coords
      })

      if (!isCurrentlyInside) {
        toast.warning('خارج منطقة العمل', {
          description: 'أنت خارج السياج الجغرافي حالياً',
          duration: 3000
        })
      }
    } else {
      setGeofenceState({
        ...currentState,
        isInside: isCurrentlyInside,
        lastKnownPosition: coords
      })
    }
  }

  const handlePositionError = (error: GeolocationPositionError) => {
    console.error('Geofence tracking error:', error)
  }

  useEffect(() => {
    if (!enabled || !settings.enabled || !navigator.geolocation) {
      return
    }

    requestNotificationPermission()

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionChange,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [enabled, settings.enabled, settings.centerLatitude, settings.centerLongitude, settings.radiusInMeters, userCenter])

  return {
    isInsideGeofence: geofenceState.isInside,
    lastKnownPosition: geofenceState.lastKnownPosition,
    checkIfInsideGeofence
  }
}
