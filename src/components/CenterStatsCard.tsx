import { Card } from '@/components/ui/card'
import { CenterStats } from '@/lib/types'

interface CenterStatsCardProps {
  name: string
  stats: CenterStats
  color: string
  icon: string
}

export function CenterStatsCard({ name, stats, color, icon }: CenterStatsCardProps) {
  const rate = stats.total > 0 
    ? Math.round(((stats.total - stats.late) / stats.total) * 100) 
    : 0

  return (
    <Card className={`p-4 md:p-5 border-r-4 ${color} shadow-md`}>
      <div className="font-extrabold text-sm md:text-base mb-3 md:mb-4 flex items-center gap-2">
        <span>{icon}</span>
        <span>{name}</span>
      </div>
      <div className="grid gap-2 text-xs md:text-sm">
        <div className="flex justify-between">
          <span className="text-secondary">إجمالي الموظفين:</span>
          <span className="font-extrabold text-foreground">{stats.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">نسبة الحضور:</span>
          <span className="font-extrabold text-success">{rate}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">حالات التأخير:</span>
          <span className="font-extrabold text-danger">{stats.late}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">دقائق التأخير:</span>
          <span className="font-extrabold text-warning">{stats.minutes}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border">
          <span className="text-secondary">مجموع الخصومات:</span>
          <span className="font-extrabold text-danger text-sm md:text-base">{stats.deductions} نقطة</span>
        </div>
      </div>
    </Card>
  )
}
