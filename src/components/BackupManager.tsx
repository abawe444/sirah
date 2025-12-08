import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Download, Upload, Database, CloudArrowDown, CloudArrowUp, Warning, CheckCircle } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface BackupData {
  version: string
  timestamp: string
  data: {
    employees: any[]
    dailyRecords: Record<string, any>
    deductionRules: any
    employeeAdvances: any[]
    employeeLeaveRequests: any[]
    anonymousReports: any[]
    locationHistory: any[]
    notifications: any[]
    geofenceSettings: any
  }
}

export function BackupManager() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<'export' | 'import' | null>(null)
  const [backupFile, setBackupFile] = useState<File | null>(null)
  const [backupPreview, setBackupPreview] = useState<BackupData | null>(null)

  const createBackup = async () => {
    try {
      setIsExporting(true)
      
      const keys = [
        'employees',
        'dailyRecords',
        'deductionRules',
        'employeeAdvances',
        'employeeLeaveRequests',
        'anonymousReports',
        'locationHistory',
        'notifications',
        'geofenceSettings'
      ]

      const backupData: any = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {}
      }

      for (const key of keys) {
        const value = await window.spark.kv.get(key)
        backupData.data[key] = value || (key === 'dailyRecords' ? {} : [])
      }

      const jsonString = JSON.stringify(backupData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`
      link.click()
      URL.revokeObjectURL(url)

      toast.success('تم إنشاء النسخة الاحتياطية بنجاح!')
      setConfirmDialog(null)
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء النسخة الاحتياطية')
      console.error('Backup error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      toast.error('يرجى اختيار ملف JSON صالح')
      return
    }

    setBackupFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const backup: BackupData = JSON.parse(content)
        
        if (!backup.version || !backup.timestamp || !backup.data) {
          toast.error('ملف النسخة الاحتياطية غير صالح')
          return
        }

        setBackupPreview(backup)
        setConfirmDialog('import')
      } catch (error) {
        toast.error('فشل قراءة ملف النسخة الاحتياطية')
        console.error('File read error:', error)
      }
    }
    reader.readAsText(file)
  }

  const restoreBackup = async () => {
    if (!backupPreview) return

    try {
      setIsImporting(true)

      for (const [key, value] of Object.entries(backupPreview.data)) {
        await window.spark.kv.set(key, value)
      }

      toast.success('تم استعادة البيانات بنجاح! سيتم إعادة تحميل الصفحة...')
      
      setTimeout(() => {
        window.location.reload()
      }, 2000)

      setConfirmDialog(null)
    } catch (error) {
      toast.error('حدث خطأ أثناء استعادة البيانات')
      console.error('Restore error:', error)
    } finally {
      setIsImporting(false)
    }
  }

  const exportRecordsOnly = async () => {
    try {
      const dailyRecords = await window.spark.kv.get('dailyRecords')
      
      const csvLines: string[] = []
      csvLines.push('التاريخ,إجمالي الموظفين,الحضور,التأخير,الغياب,إجمالي الخصومات')

      const records = dailyRecords as Record<string, any> || {}
      Object.entries(records).forEach(([date, record]) => {
        csvLines.push([
          date,
          record.stats?.total || 0,
          record.stats?.present || 0,
          record.stats?.late || 0,
          record.stats?.absent || 0,
          record.stats?.totalDeductions || 0
        ].join(','))
      })

      const blob = new Blob(['\uFEFF' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `سجلات_الحضور_${format(new Date(), 'yyyy-MM-dd')}.csv`
      link.click()

      toast.success('تم تصدير السجلات بنجاح!')
    } catch (error) {
      toast.error('حدث خطأ أثناء تصدير السجلات')
      console.error('Export error:', error)
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-4">
        <Database size={32} weight="fill" className="text-primary" />
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary">
          إدارة النسخ الاحتياطي
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <CloudArrowDown size={32} weight="fill" className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">إنشاء نسخة احتياطية</h3>
              <p className="text-sm text-muted-foreground mb-4">
                احفظ جميع بيانات النظام في ملف واحد آمن يمكن استعادته لاحقاً
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => setConfirmDialog('export')}
                  className="w-full gap-2"
                  disabled={isExporting}
                >
                  <Download size={20} />
                  {isExporting ? 'جاري الإنشاء...' : 'إنشاء نسخة احتياطية كاملة'}
                </Button>
                <Button 
                  onClick={exportRecordsOnly}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Download size={20} />
                  تصدير السجلات فقط (CSV)
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <CloudArrowUp size={32} weight="fill" className="text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">استعادة من نسخة احتياطية</h3>
              <p className="text-sm text-muted-foreground mb-4">
                استرجع جميع البيانات من ملف نسخة احتياطية سابق
              </p>
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="backup-file-input"
                />
                <Button 
                  onClick={() => document.getElementById('backup-file-input')?.click()}
                  variant="outline"
                  className="w-full gap-2"
                  disabled={isImporting}
                >
                  <Upload size={20} />
                  {isImporting ? 'جاري الاستعادة...' : 'اختيار ملف للاستعادة'}
                </Button>
              </label>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <CheckCircle size={24} weight="fill" className="text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">نصائح هامة:</h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• قم بإنشاء نسخة احتياطية قبل إجراء أي تغييرات كبيرة على النظام</li>
              <li>• احتفظ بنسخ احتياطية منتظمة في مكان آمن خارج النظام</li>
              <li>• تأكد من صحة ملف النسخة الاحتياطية قبل الاستعادة</li>
              <li>• ستتم إعادة تحميل الصفحة تلقائياً بعد الاستعادة</li>
            </ul>
          </div>
        </div>
      </Card>

      <Dialog open={confirmDialog === 'export'} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download size={24} />
              تأكيد إنشاء النسخة الاحتياطية
            </DialogTitle>
            <DialogDescription className="text-right">
              سيتم إنشاء ملف يحتوي على جميع بيانات النظام بما في ذلك:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>بيانات الموظفين وحساباتهم</li>
                <li>جميع سجلات الحضور اليومية</li>
                <li>قواعد الخصومات</li>
                <li>السلف والإجازات</li>
                <li>الإشعارات والتقارير</li>
                <li>إعدادات السياج الجغرافي</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              إلغاء
            </Button>
            <Button onClick={createBackup} disabled={isExporting}>
              {isExporting ? 'جاري الإنشاء...' : 'تأكيد الإنشاء'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialog === 'import'} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Warning size={24} className="text-warning" />
              تأكيد استعادة النسخة الاحتياطية
            </DialogTitle>
            <DialogDescription className="text-right">
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
                <p className="font-bold text-warning mb-2">⚠️ تحذير هام:</p>
                <p className="text-sm">
                  ستتم استبدال جميع البيانات الحالية بالبيانات من ملف النسخة الاحتياطية.
                  هذه العملية لا يمكن التراجع عنها!
                </p>
              </div>
              
              {backupPreview && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-muted-foreground">تاريخ النسخة</div>
                      <div className="font-bold">
                        {format(new Date(backupPreview.timestamp), 'PPP - p', { locale: ar })}
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-muted-foreground">الإصدار</div>
                      <div className="font-bold">{backupPreview.version}</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="font-bold mb-2">محتويات النسخة الاحتياطية:</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>الموظفين:</span>
                        <span className="font-bold">{backupPreview.data.employees?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>السجلات اليومية:</span>
                        <span className="font-bold">{Object.keys(backupPreview.data.dailyRecords || {}).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>السلف:</span>
                        <span className="font-bold">{backupPreview.data.employeeAdvances?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الإجازات:</span>
                        <span className="font-bold">{backupPreview.data.employeeLeaveRequests?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>التقارير:</span>
                        <span className="font-bold">{backupPreview.data.anonymousReports?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الإشعارات:</span>
                        <span className="font-bold">{backupPreview.data.notifications?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>
              إلغاء
            </Button>
            <Button 
              onClick={restoreBackup} 
              disabled={isImporting}
              variant="destructive"
            >
              {isImporting ? 'جاري الاستعادة...' : 'تأكيد الاستعادة'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
