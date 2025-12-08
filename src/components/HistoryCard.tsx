import { Card } from '@/components/ui/card'
import { DailyRecord } from '@/lib/types'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface HistoryCardProps {
  record: DailyRecord
  onClick?: () => void
}

export function HistoryCard({ record, onClick }: HistoryCardProps) {
  const date = new Date(record.date)
  const formattedDate = format(date, 'EEEE، d MMMM yyyy', { locale: ar })
  const attendanceRate = record.stats.total > 0 
    ? Math.round((record.stats.present / record.stats.total) * 100) 
    : 0

  return (
    <Card 
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-r-4 border-r-primary"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-extrabold text-lg text-primary">{formattedDate}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {(record.attendance || []).length} موظف
          </p>
        </div>
        <div className="text-left">
          <div className="text-2xl font-extrabold text-success">{attendanceRate}%</div>
          <div className="text-xs text-muted-foreground">نسبة الالتزام</div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-success/10 rounded-lg p-2">
          <div className="text-lg font-bold text-success">{record.stats.present}</div>
          <div className="text-xs text-muted-foreground">حضور</div>
        </div>
        <div className="bg-warning/10 rounded-lg p-2">
          <div className="text-lg font-bold text-warning">{record.stats.late}</div>
          <div className="text-xs text-muted-foreground">تأخير</div>
        </div>
        <div className="bg-danger/10 rounded-lg p-2">
          <div className="text-lg font-bold text-danger">{record.stats.totalDeductions}</div>
          <div className="text-xs text-muted-foreground">نقطة</div>
        </div>
      </div>
    </Card>
  )
}
