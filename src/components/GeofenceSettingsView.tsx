import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { GeofenceSettings } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { GeofenceMap } from './GeofenceMap'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, FloppyDisk, Polygon } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GeofenceSettingsViewProps {
  settings: GeofenceSettings
  onSave: (settings: GeofenceSettings) => void
}

export function GeofenceSettingsView({ settings, onSave }: GeofenceSettingsViewProps) {
  const { t, dir } = useLanguage()
  const [localSettings, setLocalSettings] = useState<GeofenceSettings>(settings)
  const [isMapMode, setIsMapMode] = useState(false)

  const handleSave = () => {
    console.log('Saving geofence settings:', localSettings)
    onSave(localSettings)
    toast.success('تم حفظ السياج الجغرافي بنجاح ✓')
  }

  const handlePolygonUpdate = (points: Array<{ lat: number; lng: number }>) => {
    console.log('Polygon updated with points:', points)
    setLocalSettings(prev => {
      const updated = {
        ...prev,
        polygonPoints: points
      }
      console.log('Updated local settings:', updated)
      return updated
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary" weight="fill" />
          السياج الجغرافي
        </CardTitle>
        <CardDescription>
          قم بتحديد السياج الجغرافي للتحكم في مواقع تسجيل الحضور
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Label className="text-base font-bold">
              تفعيل السياج الجغرافي
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              منع تسجيل الحضور خارج المنطقة المحددة
            </p>
          </div>
          <Switch
            checked={localSettings.enabled}
            onCheckedChange={(checked) =>
              setLocalSettings(prev => ({ ...prev, enabled: checked }))
            }
            className="shrink-0"
          />
        </div>

        {localSettings.enabled && (
          <div className="space-y-4">
            {!localSettings.polygonPoints || localSettings.polygonPoints.length === 0 ? (
              <Alert className="bg-yellow-50 border-yellow-500">
                <AlertDescription className="font-bold text-yellow-800">
                  ⚠️ لم يتم تحديد سياج جغرافي بعد
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-green-50 border-green-500">
                <AlertDescription className="font-bold text-green-800">
                  ✓ السياج الجغرافي محدد ({localSettings.polygonPoints.length} نقطة)
                </AlertDescription>
              </Alert>
            )}

            {isMapMode && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary shrink-0" weight="fill" />
                  <div className="flex-1 text-sm">
                    <p className="font-bold text-blue-900">وضع التحرير نشط</p>
                    <p className="text-blue-700">انقر على الخريطة لإضافة النقاط</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Polygon className="text-primary" size={20} weight="fill" />
                    <span className="font-bold">
                      السياج الجغرافي
                      {localSettings.polygonPoints && localSettings.polygonPoints.length > 0 && (
                        <span className="text-muted-foreground mr-2">
                          ({localSettings.polygonPoints.length} نقطة)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="min-h-[44px] font-bold"
                      disabled={!localSettings.polygonPoints || localSettings.polygonPoints.length < 3}
                    >
                      <FloppyDisk className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={18} weight="fill" />
                      حفظ السياج
                    </Button>
                    <Button
                      onClick={() => setIsMapMode(!isMapMode)}
                      variant="outline"
                      size="sm"
                      className="min-h-[44px] font-bold"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm space-y-1">
                    <p className="text-green-800 font-bold">طريقة الاستخدام:</p>
                    <ol className="list-decimal list-inside space-y-1 text-green-700 mr-4">
                      <li>انقر على الخريطة لإضافة نقطة</li>
                      <li>يتطلب 3 نقاط على الأقل لإنشاء سياج مغلق</li>
                      <li>استخدم زر "مسح الكل" لحذف جميع النقاط</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            <GeofenceMap
              settings={localSettings}
              editMode={isMapMode}
              onPolygonUpdate={handlePolygonUpdate}
            />

            {!isMapMode && (
              <Button 
                onClick={() => setIsMapMode(true)}
                size="lg" 
                className="w-full min-h-[44px] font-bold"
              >
                <MapPin className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={20} weight="fill" />
                تحديد على الخريطة
              </Button>
            )}

            <Button 
              onClick={handleSave}
              size="lg" 
              className="w-full min-h-[44px] font-bold"
              disabled={localSettings.enabled && (!localSettings.polygonPoints || localSettings.polygonPoints.length < 3)}
            >
              <FloppyDisk className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={20} weight="fill" />
              حفظ الإعدادات
            </Button>

            {localSettings.enabled && (!localSettings.polygonPoints || localSettings.polygonPoints.length < 3) && (
              <Alert className="bg-yellow-50 border-yellow-500">
                <AlertDescription className="font-bold text-yellow-800">
                  يجب تحديد 3 نقاط على الأقل لتفعيل السياج الجغرافي
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
