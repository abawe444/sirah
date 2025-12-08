import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, CheckCircle, XCircle, Crosshair, Trash, Stack } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CenterData {
  latitude: number;
  longitude: number;
  radius: number;
}

interface GeofenceSettings {
  enabled: boolean;
  centerLatitude: number;
  centerLongitude: number;
  radiusInMeters: number;
  allowedCenters?: Record<string, CenterData>;
  polygonPoints?: Array<{ lat: number; lng: number }>;
}

interface GeofenceMapProps {
  settings: GeofenceSettings;
  onLocationUpdate?: (coords: GeolocationCoordinates, isInsideGeofence: boolean) => void;
  showCurrentLocation?: boolean;
  userCenter?: string;
  editMode?: boolean;
  onGeofenceUpdate?: (latitude: number, longitude: number, radius: number) => void;
  onPolygonUpdate?: (points: Array<{ lat: number; lng: number }>) => void;
}

export function GeofenceMap({
  settings,
  onLocationUpdate,
  showCurrentLocation = true,
  userCenter,
  editMode = false,
  onPolygonUpdate
}: GeofenceMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const geofencePolygon = useRef<L.Polygon | L.Polyline | null>(null)
  const locationMarker = useRef<L.Marker | null>(null)
  const accuracyCircle = useRef<L.Circle | null>(null)
  const polygonMarkers = useRef<L.Marker[]>([])
  const baseLayer = useRef<L.TileLayer | null>(null)
  const satelliteLayer = useRef<L.TileLayer | null>(null)

  const [currentLocation, setCurrentLocation] = useState<GeolocationCoordinates | null>(null)
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean>(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [polygonPoints, setPolygonPoints] = useState<Array<{ lat: number; lng: number }>>(
    settings.polygonPoints || []
  )
  const [showSatellite, setShowSatellite] = useState<boolean>(false)
  const editModeRef = useRef(editMode)

  useEffect(() => {
    editModeRef.current = editMode
  }, [editMode])

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

  const isPointInPolygon = (lat: number, lng: number, polygon: Array<{ lat: number; lng: number }>): boolean => {
    if (polygon.length < 3) return false
    
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng
      const xj = polygon[j].lat, yj = polygon[j].lng
      
      const intersect = ((yi > lng) !== (yj > lng)) &&
        (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    
    return inside
  }

  const checkIfInsideGeofence = (coords: GeolocationCoordinates): boolean => {
    if (!settings.enabled) return true

    if (polygonPoints.length >= 3) {
      return isPointInPolygon(coords.latitude, coords.longitude, polygonPoints)
    }

    if (userCenter && settings.allowedCenters && settings.allowedCenters[userCenter]) {
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

  const updateCurrentLocation = () => {
    if (!showCurrentLocation) return

    setIsLoadingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('الموقع الجغرافي غير مدعوم في متصفحك')
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = position.coords
        setCurrentLocation(coords)
        
        const inside = checkIfInsideGeofence(coords)
        setIsInsideGeofence(inside)
        setIsLoadingLocation(false)

        if (onLocationUpdate) {
          onLocationUpdate(coords, inside)
        }

        if (mapInstance.current) {
          const latLng: [number, number] = [coords.latitude, coords.longitude]

          if (locationMarker.current) {
            locationMarker.current.setLatLng(latLng)
            const el = locationMarker.current.getElement()
            if (el && el.firstElementChild) {
               (el.firstElementChild as HTMLElement).style.background = inside ? '#10b981' : '#ef4444'
            }
            locationMarker.current.setPopupContent(inside ? 'أنت داخل المنطقة المسموحة ✓' : 'أنت خارج المنطقة المسموحة ✗')
          } else {
            const icon = L.divIcon({
              className: 'custom-location-marker',
              html: `<div style="width: 24px; height: 24px; background: ${inside ? '#10b981' : '#ef4444'}; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
              iconAnchor: [12, 12]
            })
            
            locationMarker.current = L.marker(latLng, { icon })
              .addTo(mapInstance.current)
              .bindPopup(inside ? 'أنت داخل المنطقة المسموحة ✓' : 'أنت خارج المنطقة المسموحة ✗')
          }

          if (coords.accuracy) {
            if (accuracyCircle.current) {
              accuracyCircle.current.setLatLng(latLng)
              accuracyCircle.current.setRadius(coords.accuracy)
              accuracyCircle.current.setStyle({ color: inside ? '#10b981' : '#ef4444', fillColor: inside ? '#10b981' : '#ef4444' })
            } else {
              accuracyCircle.current = L.circle(latLng, {
                radius: coords.accuracy,
                color: inside ? '#10b981' : '#ef4444',
                fillColor: inside ? '#10b981' : '#ef4444',
                fillOpacity: 0.1,
                weight: 1
              }).addTo(mapInstance.current)
            }
          }

          mapInstance.current.setView(latLng, 16)
        }
      },
      (error) => {
        setIsLoadingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('تم رفض الوصول للموقع. الرجاء السماح بالوصول للموقع')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('الموقع غير متوفر حالياً')
            break
          case error.TIMEOUT:
            setLocationError('انتهت مهلة الحصول على الموقع')
            break
          default:
            setLocationError('حدث خطأ في الحصول على الموقع')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const addPolygonPoint = useCallback((latlng: L.LatLng) => {
    if (!mapInstance.current) {
      console.log('Map instance not available')
      return
    }

    console.log('Adding polygon point:', latlng.lat, latlng.lng)

    const newPoint = { lat: latlng.lat, lng: latlng.lng }
    
    setPolygonPoints(currentPoints => {
      const newPoints = [...currentPoints, newPoint]
      
      const markerIcon = L.divIcon({
        className: 'polygon-point-marker',
        html: `<div style="width: 16px; height: 16px; background: #10b981; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;"></div>`,
        iconAnchor: [8, 8]
      })

      const marker = L.marker(latlng, { 
        icon: markerIcon,
        draggable: false
      }).addTo(mapInstance.current!)
      
      polygonMarkers.current.push(marker)

      updatePolygon(newPoints)
      
      if (onPolygonUpdate) {
        onPolygonUpdate(newPoints)
      }
      
      toast.success(`تم إضافة النقطة ${newPoints.length} - ${newPoints.length >= 3 ? 'السياج مكتمل!' : `يتطلب ${3 - newPoints.length} نقاط إضافية`}`)
      
      return newPoints
    })
  }, [onPolygonUpdate])

  useEffect(() => {
    if (!mapInstance.current) return

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (editMode) {
        addPolygonPoint(e.latlng)
      }
    }

    mapInstance.current.off('click')
    mapInstance.current.on('click', handleMapClick)

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('click', handleMapClick)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode])

  const updatePolygon = (points: Array<{ lat: number; lng: number }>) => {
    if (!mapInstance.current) return

    if (geofencePolygon.current) {
      mapInstance.current.removeLayer(geofencePolygon.current)
    }

    if (points.length >= 3) {
      const latlngs: [number, number][] = points.map(p => [p.lat, p.lng])
      geofencePolygon.current = L.polygon(latlngs, {
        color: '#f97316',
        fillColor: '#f97316',
        fillOpacity: 0.2,
        weight: 3
      }).addTo(mapInstance.current)
        .bindPopup(`<div style="font-family: 'Cairo', sans-serif; text-align: center;">
          <b style="font-size: 14px;">السياج الجغرافي</b><br>
          <span style="font-size: 12px;">${points.length} نقاط</span>
        </div>`)
    } else if (points.length === 2) {
      const latlngs: [number, number][] = points.map(p => [p.lat, p.lng])
      geofencePolygon.current = L.polyline(latlngs, {
        color: '#10b981',
        weight: 3,
        dashArray: '10, 5'
      }).addTo(mapInstance.current)
    } else if (points.length === 1) {
      const markerIcon = L.divIcon({
        className: 'start-point-marker',
        html: `<div style="padding: 4px 8px; background: #10b981; color: white; border-radius: 6px; font-weight: 700; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); white-space: nowrap; font-family: 'Cairo', sans-serif;">📍 نقطة البداية</div>`,
        iconAnchor: [40, 30]
      })
      
      L.marker([points[0].lat, points[0].lng], { icon: markerIcon })
        .addTo(mapInstance.current)
    }
  }

  const clearPolygon = () => {
    const pointCount = polygonPoints.length
    setPolygonPoints([])
    
    if (geofencePolygon.current && mapInstance.current) {
      mapInstance.current.removeLayer(geofencePolygon.current)
      geofencePolygon.current = null
    }

    polygonMarkers.current.forEach(marker => {
      if (mapInstance.current) {
        mapInstance.current.removeLayer(marker)
      }
    })
    polygonMarkers.current = []

    if (onPolygonUpdate) {
      onPolygonUpdate([])
    }
    
    if (pointCount > 0) {
      toast.success(`تم مسح جميع النقاط (${pointCount})`)
    }
  }

  const toggleLayerView = () => {
    if (!mapInstance.current || !baseLayer.current || !satelliteLayer.current) return

    if (showSatellite) {
      mapInstance.current.removeLayer(satelliteLayer.current)
      baseLayer.current.addTo(mapInstance.current)
    } else {
      mapInstance.current.removeLayer(baseLayer.current)
      satelliteLayer.current.addTo(mapInstance.current)
    }
    setShowSatellite(!showSatellite)
  }

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return

    let initialLat = settings.centerLatitude
    let initialLng = settings.centerLongitude

    if (userCenter && settings.allowedCenters && settings.allowedCenters[userCenter]) {
       const centerData = settings.allowedCenters[userCenter]
       initialLat = centerData.latitude
       initialLng = centerData.longitude
    }

    const map = L.map(mapContainer.current, {
      zoomControl: true,
      attributionControl: true
    }).setView([initialLat, initialLng], 15)

    baseLayer.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    satelliteLayer.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri, Maxar, Earthstar Geographics',
      maxZoom: 19
    })

    mapInstance.current = map

    if (polygonPoints.length > 0) {
      updatePolygon(polygonPoints)
      polygonPoints.forEach((point) => {
        const markerIcon = L.divIcon({
          className: 'polygon-point-marker',
          html: `<div style="width: 16px; height: 16px; background: #10b981; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;"></div>`,
          iconAnchor: [8, 8]
        })

        const marker = L.marker([point.lat, point.lng], { 
          icon: markerIcon,
          draggable: false
        }).addTo(map)
        
        polygonMarkers.current.push(marker)
      })
    }

    if (showCurrentLocation) {
      updateCurrentLocation()
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapInstance.current) return

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      console.log('Map clicked!', 'Edit mode:', editModeRef.current)
      if (editModeRef.current) {
        addPolygonPoint(e.latlng)
      }
    }

    mapInstance.current.off('click')
    mapInstance.current.on('click', handleMapClick)

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('click', handleMapClick)
      }
    }
  }, [addPolygonPoint])

  return (
    <Card className="overflow-hidden w-full bg-white shadow-md">
      <div className="relative h-[400px] md:h-[500px] w-full">
        <div 
          ref={mapContainer} 
          className="h-full w-full z-0"
          style={{ cursor: editMode ? 'crosshair' : 'grab' }}
        />
        
        {editMode && (
          <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 z-[400] bg-green-600 text-white p-2 md:p-3 rounded-lg shadow-lg font-bold text-xs md:text-sm text-center animate-pulse">
            📍 انقر لإضافة نقاط - سيتم توصيل النقاط تلقائياً
          </div>
        )}

        <div className="absolute top-2 md:top-4 right-2 md:right-4 z-[400] flex flex-col gap-2">
          <Button
            size="icon"
            onClick={toggleLayerView}
            className="bg-white text-foreground hover:bg-gray-100 shadow-lg w-10 h-10 md:w-12 md:h-12"
            title={showSatellite ? 'عرض الخريطة العادية' : 'عرض صور القمر الصناعي'}
          >
            <Stack size={20} weight="bold" />
          </Button>
        </div>
        
        {showCurrentLocation && (
          <Button
            size="icon"
            onClick={updateCurrentLocation}
            disabled={isLoadingLocation}
            className="absolute bottom-20 md:bottom-4 right-2 md:right-4 z-[400] bg-white text-foreground hover:bg-gray-100 shadow-lg w-10 h-10 md:w-12 md:h-12"
            title="تحديث موقعي"
          >
            <Crosshair size={20} className={isLoadingLocation ? "animate-spin" : ""} weight="bold" />
          </Button>
        )}

        {editMode && polygonPoints.length > 0 && (
          <Button
            size="icon"
            onClick={clearPolygon}
            className="absolute bottom-20 md:bottom-4 left-2 md:left-4 z-[400] bg-red-600 text-white hover:bg-red-700 shadow-lg w-10 h-10 md:w-12 md:h-12"
            title="مسح جميع النقاط"
          >
            <Trash size={20} weight="bold" />
          </Button>
        )}
      </div>

      <div className="p-3 md:p-4 border-t bg-gray-50 space-y-2 md:space-y-3">
        {editMode && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            <AlertDescription className="mr-2 font-bold text-xs md:text-sm">
              {polygonPoints.length === 0 
                ? 'انقر على الخريطة لإضافة النقطة الأولى 📍'
                : polygonPoints.length < 3
                  ? `تم إضافة ${polygonPoints.length} نقطة - يتطلب ${3 - polygonPoints.length} نقاط إضافية لإنشاء سياج`
                  : `تم إنشاء السياج بنجاح! (${polygonPoints.length} نقطة) ✓ - يمكنك إضافة المزيد من النقاط أو الضغط على "حفظ السياج"`
              }
            </AlertDescription>
          </Alert>
        )}
        
        {locationError ? (
          <Alert variant="destructive">
             <XCircle className="h-4 w-4" />
             <AlertDescription className="text-xs md:text-sm">{locationError}</AlertDescription>
          </Alert>
        ) : currentLocation ? (
          <Alert className={isInsideGeofence ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
            {isInsideGeofence ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" /> : <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />}
            <AlertDescription className="mr-2 font-bold text-xs md:text-sm">
              {isInsideGeofence 
                ? 'أنت متواجد داخل النطاق المسموح لتسجيل الحضور' 
                : 'أنت خارج النطاق الجغرافي المسموح'}
            </AlertDescription>
          </Alert>
        ) : showCurrentLocation ? (
          <div className="flex items-center text-gray-500 text-xs md:text-sm">
            <MapPin className="mr-2" size={16} />
            <span>جاري تحديد موقعك...</span>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
