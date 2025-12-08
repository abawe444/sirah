import { Card } from '@/components/ui/card'

interface StatCardProps {
  value: string | number
  label: string
  color?: string
}

export function StatCard({ value, label, color = 'primary' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    primary: 'border-r-primary text-primary',
    success: 'border-r-success text-success',
    danger: 'border-r-danger text-danger',
    warning: 'border-r-warning text-warning',
  }

  return (
    <Card className={`p-3 md:p-4 border-r-4 ${colorMap[color]} transition-transform hover:-translate-y-1 shadow-md`}>
      <div className="flex flex-col">
        <span className="text-xl md:text-2xl font-extrabold">{value}</span>
        <span className="text-secondary text-xs md:text-sm font-bold mt-1">{label}</span>
      </div>
    </Card>
  )
}
