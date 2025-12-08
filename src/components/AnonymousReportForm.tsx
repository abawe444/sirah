import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldWarning, Upload, X, Image as ImageIcon, VideoCamera, Check } from '@phosphor-icons/react'
import { ViolationType, Center, AnonymousReport, ReportMedia } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'

interface AnonymousReportFormProps {
  userCenter: Center
  onClose?: () => void
}

const VIOLATION_TYPES: ViolationType[] = [
  'سلوك غير لائق',
  'إهمال في العمل',
  'تأخر متكرر',
  'غياب بدون إذن',
  'سوء معاملة',
  'مخالفة أمنية',
  'أخرى'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_FILES = 3

export function AnonymousReportForm({ userCenter, onClose }: AnonymousReportFormProps) {
  const { t, dir } = useLanguage()
  const [reports, setReports] = useKV<AnonymousReport[]>('anonymous-reports', [])
  
  const [violationType, setViolationType] = useState<ViolationType | ''>('')
  const [description, setDescription] = useState('')
  const [mediaFiles, setMediaFiles] = useState<ReportMedia[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (mediaFiles.length >= MAX_FILES) {
      toast.error(`يمكنك إرفاق ${MAX_FILES} ملفات كحد أقصى`)
      return
    }

    const remainingSlots = MAX_FILES - mediaFiles.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    for (const file of filesToProcess) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`حجم الملف ${file.name} كبير جداً (الحد الأقصى 10MB)`)
        continue
      }

      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`الملف ${file.name} غير مدعوم. يرجى اختيار صورة أو فيديو`)
        continue
      }

      try {
        const dataUrl = await readFileAsDataURL(file)
        const media: ReportMedia = {
          id: `media-${Date.now()}-${Math.random()}`,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          dataUrl,
          timestamp: Date.now(),
          size: file.size
        }
        setMediaFiles(prev => [...prev, media])
      } catch (error) {
        toast.error(`فشل في رفع الملف ${file.name}`)
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const removeMedia = (id: string) => {
    setMediaFiles(prev => prev.filter(m => m.id !== id))
  }

  const handleSubmit = () => {
    if (!violationType) {
      toast.error('يرجى اختيار نوع المخالفة')
      return
    }

    if (!description.trim()) {
      toast.error('يرجى كتابة وصف للمخالفة')
      return
    }

    setIsSubmitting(true)

    const newReport: AnonymousReport = {
      id: `report-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      center: userCenter,
      violationType: violationType as ViolationType,
      description: description.trim(),
      mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
      status: 'جديد'
    }

    setReports((current) => [...(current || []), newReport])

    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
      
      setTimeout(() => {
        setViolationType('')
        setDescription('')
        setMediaFiles([])
        setShowSuccess(false)
        if (onClose) onClose()
      }, 2000)
    }, 800)

    toast.success('تم إرسال البلاغ بنجاح')
  }

  const handleReset = () => {
    setViolationType('')
    setDescription('')
    setMediaFiles([])
  }

  if (showSuccess) {
    return (
      <Card className="border-2 border-success" dir={dir}>
        <CardContent className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <Check size={40} className="text-success" weight="bold" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-success mb-2">تم إرسال البلاغ بنجاح</h3>
          <p className="text-muted-foreground">
            شكراً لك. سيتم مراجعة البلاغ من قبل المسؤول بسرية تامة.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/20" dir={dir}>
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <ShieldWarning size={24} weight="duotone" className="text-destructive" />
          بلاغ سري
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          أبلغ عن المخالفات بسرية تامة دون كشف هويتك
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 space-y-4">
        <Alert className="border-2 border-warning bg-warning/10">
          <ShieldWarning className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={20} />
          <AlertDescription className="text-sm font-medium">
            🔒 هذا البلاغ مجهول تماماً ولن يتم الكشف عن هويتك بأي حال من الأحوال
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="violation-type" className="text-base font-bold">
            نوع المخالفة <span className="text-destructive">*</span>
          </Label>
          <Select value={violationType} onValueChange={(value) => setViolationType(value as ViolationType)}>
            <SelectTrigger id="violation-type" className="min-h-[44px] text-base">
              <SelectValue placeholder="اختر نوع المخالفة" />
            </SelectTrigger>
            <SelectContent>
              {VIOLATION_TYPES.map(type => (
                <SelectItem key={type} value={type} className="text-base">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-bold">
            وصف المخالفة <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب تفاصيل المخالفة بشكل واضح ودقيق..."
            className="min-h-[120px] text-base resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-left">
            {description.length} / 1000
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-bold">
            المرفقات (اختياري)
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            يمكنك إرفاق صور أو فيديوهات كدليل (حتى {MAX_FILES} ملفات، حجم كل ملف حتى 10MB)
          </p>
          
          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              {mediaFiles.map((media) => (
                <div key={media.id} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted border-2 border-border">
                    {media.type === 'image' ? (
                      <img 
                        src={media.dataUrl} 
                        alt="مرفق" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video 
                        src={media.dataUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 left-1 md:top-2 md:left-2 w-7 h-7 md:w-8 md:h-8 opacity-90 group-hover:opacity-100"
                    onClick={() => removeMedia(media.id)}
                  >
                    <X size={16} weight="bold" />
                  </Button>
                  <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                    {media.type === 'image' ? (
                      <ImageIcon size={14} weight="fill" />
                    ) : (
                      <VideoCamera size={14} weight="fill" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {mediaFiles.length < MAX_FILES && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[44px] text-base"
                type="button"
              >
                <Upload className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={20} />
                إرفاق صور أو فيديوهات ({mediaFiles.length}/{MAX_FILES})
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !violationType || !description.trim()}
            className="flex-1 min-h-[50px] text-base font-bold"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <span className="animate-pulse">جاري الإرسال...</span>
              </>
            ) : (
              <>
                <ShieldWarning className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={22} weight="fill" />
                إرسال البلاغ
              </>
            )}
          </Button>
          {(violationType || description || mediaFiles.length > 0) && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              className="min-h-[50px] text-base"
              size="lg"
            >
              إعادة تعيين
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
