import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ShieldWarning, 
  Eye, 
  CheckCircle, 
  XCircle, 
  ChatCircleText,
  Image as ImageIcon,
  VideoCamera,
  Calendar,
  MapPin,
  X
} from '@phosphor-icons/react'
import { AnonymousReport, Employee } from '@/lib/types'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'

interface AnonymousReportsViewProps {
  currentUser: Employee
  onBack: () => void
}

const getStatusBadge = (status: AnonymousReport['status']) => {
  switch (status) {
    case 'جديد':
      return <Badge className="bg-destructive text-destructive-foreground">جديد</Badge>
    case 'قيد المراجعة':
      return <Badge className="bg-warning text-warning-foreground">قيد المراجعة</Badge>
    case 'تم الحل':
      return <Badge className="bg-success text-success-foreground">تم الحل</Badge>
    case 'مرفوض':
      return <Badge variant="secondary">مرفوض</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getViolationIcon = (type: string) => {
  return <ShieldWarning size={20} weight="fill" className="text-destructive" />
}

export function AnonymousReportsView({ currentUser, onBack }: AnonymousReportsViewProps) {
  const { t, dir } = useLanguage()
  const [reports, setReports] = useKV<AnonymousReport[]>('anonymous-reports', [])
  const [selectedReport, setSelectedReport] = useState<AnonymousReport | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null)

  const handleStatusChange = (reportId: string, newStatus: AnonymousReport['status']) => {
    setReports((current) => 
      (current || []).map(report =>
        report.id === reportId
          ? {
              ...report,
              status: newStatus,
              resolvedDate: newStatus === 'تم الحل' || newStatus === 'مرفوض' ? new Date().toISOString() : undefined,
              resolvedBy: newStatus === 'تم الحل' || newStatus === 'مرفوض' ? currentUser.name : undefined
            }
          : report
      )
    )
    toast.success(`تم تحديث حالة البلاغ إلى: ${newStatus}`)
  }

  const handleSaveNotes = (reportId: string) => {
    setReports((current) =>
      (current || []).map(report =>
        report.id === reportId
          ? { ...report, adminNotes: adminNotes.trim() }
          : report
      )
    )
    toast.success('تم حفظ الملاحظات')
    setAdminNotes('')
  }

  const handleDeleteReport = (reportId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا البلاغ؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setReports((current) => (current || []).filter(r => r.id !== reportId))
      setSelectedReport(null)
      toast.success('تم حذف البلاغ')
    }
  }

  const sortedReports = [...(reports || [])].sort((a, b) => {
    const statusOrder = { 'جديد': 0, 'قيد المراجعة': 1, 'تم الحل': 2, 'مرفوض': 3 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  const newReportsCount = (reports || []).filter(r => r.status === 'جديد').length
  const underReviewCount = (reports || []).filter(r => r.status === 'قيد المراجعة').length
  const resolvedCount = (reports || []).filter(r => r.status === 'تم الحل').length

  return (
    <div dir={dir}>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground min-h-[44px] px-3"
        >
          {dir === 'rtl' ? '← ' : '→ '}{t('dashboard.backToDashboard')}
        </button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <ShieldWarning size={28} weight="duotone" className="text-destructive" />
            البلاغات السرية
          </CardTitle>
          <CardDescription>
            إدارة ومراجعة البلاغات السرية المقدمة من الموظفين
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">بلاغات جديدة</p>
                <p className="text-3xl font-bold text-destructive">{newReportsCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldWarning size={24} className="text-destructive" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">قيد المراجعة</p>
                <p className="text-3xl font-bold text-warning">{underReviewCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Eye size={24} className="text-warning" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">تم الحل</p>
                <p className="text-3xl font-bold text-success">{resolvedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle size={24} className="text-success" weight="fill" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 h-auto">
          <TabsTrigger value="all" className="text-xs md:text-sm py-2 md:py-2.5">
            <span className="hidden sm:inline">الكل ({(reports || []).length})</span>
            <span className="sm:hidden">كل ({(reports || []).length})</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="text-xs md:text-sm py-2 md:py-2.5">
            <span className="hidden sm:inline">جديد ({newReportsCount})</span>
            <span className="sm:hidden">جديد ({newReportsCount})</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs md:text-sm py-2 md:py-2.5">
            <span className="hidden sm:inline">قيد المراجعة ({underReviewCount})</span>
            <span className="sm:hidden">مراجعة ({underReviewCount})</span>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs md:text-sm py-2 md:py-2.5">
            <span className="hidden sm:inline">تم الحل ({resolvedCount})</span>
            <span className="sm:hidden">حل ({resolvedCount})</span>
          </TabsTrigger>
        </TabsList>

        {['all', 'new', 'review', 'resolved'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-4">
              {sortedReports
                .filter(report => {
                  if (tab === 'new') return report.status === 'جديد'
                  if (tab === 'review') return report.status === 'قيد المراجعة'
                  if (tab === 'resolved') return report.status === 'تم الحل' || report.status === 'مرفوض'
                  return true
                })
                .map(report => (
                  <Card 
                    key={report.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      report.status === 'جديد' ? 'border-2 border-destructive/50' : ''
                    }`}
                    onClick={() => {
                      setSelectedReport(report)
                      setAdminNotes(report.adminNotes || '')
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getViolationIcon(report.violationType)}
                              <span className="font-bold text-lg">{report.violationType}</span>
                            </div>
                            {getStatusBadge(report.status)}
                          </div>

                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {report.description}
                          </p>

                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(report.timestamp).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                              {' - '}
                              {new Date(report.timestamp).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              {report.center}
                            </div>
                            {report.mediaFiles && report.mediaFiles.length > 0 && (
                              <div className="flex items-center gap-1 text-primary font-medium">
                                <ImageIcon size={14} />
                                {report.mediaFiles.length} مرفق
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedReport(report)
                            setAdminNotes(report.adminNotes || '')
                          }}
                        >
                          <Eye className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={16} />
                          عرض التفاصيل
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {sortedReports.filter(report => {
                if (tab === 'new') return report.status === 'جديد'
                if (tab === 'review') return report.status === 'قيد المراجعة'
                if (tab === 'resolved') return report.status === 'تم الحل' || report.status === 'مرفوض'
                return true
              }).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ShieldWarning size={48} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">لا توجد بلاغات في هذه الفئة</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={dir}>
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <ShieldWarning size={24} weight="fill" className="text-destructive" />
                  تفاصيل البلاغ السري
                </DialogTitle>
                <DialogDescription>
                  البلاغ رقم: {selectedReport.id.split('-')[1]}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Alert className="border-2 border-warning bg-warning/10">
                  <ShieldWarning className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={20} />
                  <AlertDescription className="text-sm font-medium">
                    🔒 هذا البلاغ مجهول - لا تحاول الكشف عن هوية المبلغ
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-bold text-muted-foreground">نوع المخالفة</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getViolationIcon(selectedReport.violationType)}
                      <span className="font-bold text-lg">{selectedReport.violationType}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-bold text-muted-foreground">الحالة</Label>
                    <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                  </div>

                  <div>
                    <Label className="text-sm font-bold text-muted-foreground">التاريخ والوقت</Label>
                    <div className="flex items-center gap-1 mt-1 text-sm">
                      <Calendar size={16} />
                      {new Date(selectedReport.timestamp).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {' - '}
                      {new Date(selectedReport.timestamp).toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-bold text-muted-foreground">المركز</Label>
                    <div className="flex items-center gap-1 mt-1 text-sm">
                      <MapPin size={16} />
                      {selectedReport.center}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-bold text-muted-foreground">وصف المخالفة</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedReport.description}
                  </div>
                </div>

                {selectedReport.mediaFiles && selectedReport.mediaFiles.length > 0 && (
                  <div>
                    <Label className="text-sm font-bold text-muted-foreground mb-2 block">
                      المرفقات ({selectedReport.mediaFiles.length})
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedReport.mediaFiles.map((media) => (
                        <div 
                          key={media.id} 
                          className="aspect-video rounded-lg overflow-hidden bg-muted border-2 border-border cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedMediaUrl(media.dataUrl)}
                        >
                          {media.type === 'image' ? (
                            <img 
                              src={media.dataUrl} 
                              alt="مرفق" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              <video 
                                src={media.dataUrl}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <VideoCamera size={32} className="text-white" weight="fill" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="admin-notes" className="text-sm font-bold">
                    <ChatCircleText className={dir === 'rtl' ? 'ml-1' : 'mr-1'} size={16} weight="fill" />
                    ملاحظات المسؤول
                  </Label>
                  <Textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="اكتب ملاحظاتك أو الإجراءات المتخذة..."
                    className="mt-2 min-h-[100px]"
                  />
                  {adminNotes !== (selectedReport.adminNotes || '') && (
                    <Button
                      onClick={() => handleSaveNotes(selectedReport.id)}
                      className="mt-2"
                      size="sm"
                    >
                      حفظ الملاحظات
                    </Button>
                  )}
                </div>

                {selectedReport.resolvedBy && selectedReport.resolvedDate && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      تم الحل بواسطة: {selectedReport.resolvedBy} في{' '}
                      {new Date(selectedReport.resolvedDate).toLocaleDateString('ar-SA')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleStatusChange(selectedReport.id, 'قيد المراجعة')}
                    variant="outline"
                    disabled={selectedReport.status === 'قيد المراجعة'}
                    className="flex-1"
                  >
                    <Eye className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={18} />
                    وضع قيد المراجعة
                  </Button>

                  <Button
                    onClick={() => handleStatusChange(selectedReport.id, 'تم الحل')}
                    disabled={selectedReport.status === 'تم الحل'}
                    className="flex-1 bg-success hover:bg-success/90"
                  >
                    <CheckCircle className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={18} weight="fill" />
                    تم الحل
                  </Button>

                  <Button
                    onClick={() => handleStatusChange(selectedReport.id, 'مرفوض')}
                    variant="destructive"
                    disabled={selectedReport.status === 'مرفوض'}
                    className="flex-1"
                  >
                    <XCircle className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={18} weight="fill" />
                    رفض
                  </Button>

                  <Button
                    onClick={() => handleDeleteReport(selectedReport.id)}
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={18} weight="bold" />
                    حذف
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedMediaUrl} onOpenChange={(open) => !open && setSelectedMediaUrl(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0">
          {selectedMediaUrl && (
            <div className="relative">
              {selectedMediaUrl.startsWith('data:image') ? (
                <img src={selectedMediaUrl} alt="مرفق" className="w-full h-auto" />
              ) : (
                <video src={selectedMediaUrl} controls className="w-full h-auto" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
