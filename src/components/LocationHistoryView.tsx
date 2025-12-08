import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Clock, SignIn, SignOut, MapTrifold } from '@phosphor-icons/react'
import { EmployeeAttendanceRecord, GeofenceSettings } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LocationHistoryViewProps {
  records: EmployeeAttendanceRecord[]
  employeeName?: string
}

const checkInIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#10b981" stroke="white" stroke-width="3"/>
      <path d="M12 16l3 3 6-6" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

const checkOutIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="#3b82f6" stroke="white" stroke-width="3"/>
      <path d="M12 12l8 8M20 12l-8 8" stroke="white" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
})

export function LocationHistoryView({ records, employeeName }: LocationHistoryViewProps) {
  const { t, dir } = useLanguage()
  const [selectedRecord, setSelectedRecord] = useState<EmployeeAttendanceRecord | null>(null)
  const [showMap, setShowMap] = useState(false)

  const sortedRecords = [...records].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const recordsWithLocation = sortedRecords.filter(r => r.checkInLocation || r.checkOutLocation)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getMapCenter = () => {
    if (selectedRecord?.checkInLocation) {
      return [selectedRecord.checkInLocation.latitude, selectedRecord.checkInLocation.longitude] as [number, number]
    }
    if (recordsWithLocation[0]?.checkInLocation) {
      return [recordsWithLocation[0].checkInLocation.latitude, recordsWithLocation[0].checkInLocation.longitude] as [number, number]
    }
    return [21.3891, 39.8579] as [number, number]
  }

  return (
    <div className="space-y-4 md:space-y-6" dir={dir}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <MapPin size={28} weight="duotone" className="text-primary" />
            {t('attendance.locationHistory') || 'سجل مواقع الحضور والانصراف'}
          </h2>
          {employeeName && (
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              {employeeName}
            </p>
          )}
        </div>
        
        {recordsWithLocation.length > 0 && (
          <Button 
            variant={showMap ? "default" : "outline"}
            onClick={() => setShowMap(!showMap)}
            className="w-full md:w-auto min-h-[44px]"
          >
            <MapTrifold className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={20} weight="duotone" />
            {showMap ? 'إخفاء الخريطة' : 'عرض الخريطة'}
          </Button>
        )}
      </div>

      {recordsWithLocation.length === 0 && (
        <Card>
          <CardContent className="p-8 md:p-12 text-center">
            <MapPin size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" weight="duotone" />
            <p className="text-base md:text-lg text-muted-foreground">
              لا توجد سجلات مواقع متاحة
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              سيتم عرض مواقع الحضور والانصراف عند تفعيل نظام السياج الجغرافي
            </p>
          </CardContent>
        </Card>
      )}

      {showMap && recordsWithLocation.length > 0 && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div style={{ height: '400px', width: '100%' }}>
              <MapContainer
                center={getMapCenter()}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {recordsWithLocation.map((record) => (
                  <div key={record.id}>
                    {record.checkInLocation && (
                      <Marker
                        position={[record.checkInLocation.latitude, record.checkInLocation.longitude]}
                        icon={checkInIcon}
                      >
                        <Popup>
                          <div className="p-2" dir={dir}>
                            <p className="font-bold text-green-600 mb-1">
                              <SignIn className="inline" size={16} /> تسجيل حضور
                            </p>
                            <p className="text-sm">{formatDate(record.date)}</p>
                            <p className="text-sm font-semibold">{record.checkInTime}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {record.checkInLocation.latitude.toFixed(6)}, {record.checkInLocation.longitude.toFixed(6)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {record.checkOutLocation && (
                      <Marker
                        position={[record.checkOutLocation.latitude, record.checkOutLocation.longitude]}
                        icon={checkOutIcon}
                      >
                        <Popup>
                          <div className="p-2" dir={dir}>
                            <p className="font-bold text-blue-600 mb-1">
                              <SignOut className="inline" size={16} /> تسجيل انصراف
                            </p>
                            <p className="text-sm">{formatDate(record.date)}</p>
                            <p className="text-sm font-semibold">{record.checkOutTime}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {record.checkOutLocation.latitude.toFixed(6)}, {record.checkOutLocation.longitude.toFixed(6)}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </div>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {recordsWithLocation.map((record) => (
          <Card 
            key={record.id}
            className={`transition-all cursor-pointer hover:shadow-lg ${
              selectedRecord?.id === record.id ? 'border-2 border-primary' : ''
            }`}
            onClick={() => {
              setSelectedRecord(record)
              setShowMap(true)
            }}
          >
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Calendar size={20} weight="duotone" />
                    {formatDate(record.date)}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {record.status === 'checked-out' ? 'اكتمل اليوم' : 'قيد العمل'}
                  </CardDescription>
                </div>
                
                <div className="flex gap-2">
                  {record.checkInLocation && (
                    <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                      <SignIn size={14} />
                      حضور
                    </div>
                  )}
                  {record.checkOutLocation && (
                    <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                      <SignOut size={14} />
                      انصراف
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 md:p-6 pt-0 space-y-4">
              {record.checkInLocation && (
                <div className="p-3 md:p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <SignIn size={20} className="text-green-600" weight="bold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-green-900 mb-1">تسجيل الحضور</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-green-700">
                          <Clock size={16} />
                          <span className="font-bold">{record.checkInTime}</span>
                        </div>
                        <div className="flex items-start gap-2 text-green-600">
                          <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                          <span className="text-xs break-all">
                            {record.checkInLocation.latitude.toFixed(6)}, {record.checkInLocation.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {record.checkOutLocation && (
                <div className="p-3 md:p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <SignOut size={20} className="text-blue-600" weight="bold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-blue-900 mb-1">تسجيل الانصراف</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Clock size={16} />
                          <span className="font-bold">{record.checkOutTime}</span>
                        </div>
                        <div className="flex items-start gap-2 text-blue-600">
                          <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                          <span className="text-xs break-all">
                            {record.checkOutLocation.latitude.toFixed(6)}, {record.checkOutLocation.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
