import { Employee, DailyRecord, Center } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/LanguageContext'
import { Trophy, TrendUp, TrendDown, Medal, Clock, Users, Minus } from '@phosphor-icons/react'
import { CENTERS } from '@/lib/attendance'

interface CenterComparisonViewProps {
  employees: Employee[]
  records: Record<string, DailyRecord>
  onBack: () => void
}

interface CenterPerformance {
  center: Center
  totalEmployees: number
  attendanceRate: number
  avgLateMinutes: number
  totalDeductions: number
  rank: number
  trend: 'up' | 'down' | 'stable'
  color: string
  icon: string
}

export function CenterComparisonView({ employees, records, onBack }: CenterComparisonViewProps) {
  const { t, dir } = useLanguage()

  const getCenterColor = (center: Center): string => {
    if (center === CENTERS.US) return 'bg-center-us'
    if (center === CENTERS.EU) return 'bg-center-eu'
    return 'bg-center-main'
  }

  const getCenterIcon = (center: Center): string => {
    if (center === CENTERS.US) return '🇺🇸'
    if (center === CENTERS.EU) return '🇪🇺'
    return '🏛️'
  }

  const calculateCenterPerformance = (): CenterPerformance[] => {
    const centers = [CENTERS.US, CENTERS.EU, CENTERS.MAIN]
    const currentMonth = new Date().toISOString().slice(0, 7)

    const performances: CenterPerformance[] = centers.map(center => {
      const centerEmployees = employees.filter(e => e.center === center)
      const totalEmployees = centerEmployees.length

      let totalPresent = 0
      let totalLate = 0
      let totalDeductions = 0
      let totalMinutes = 0
      let recordCount = 0

      Object.entries(records).forEach(([date, record]) => {
        if (date.startsWith(currentMonth)) {
          recordCount++
          const centerRecords = (record.employees || record.attendance || []).filter(e => 
            centerEmployees.some(ce => ce.id === e.employeeId)
          )

          centerRecords.forEach(r => {
            if ((r.lateMinutes || 0) === 0) totalPresent++
            else totalLate++
            totalMinutes += r.lateMinutes || 0
            totalDeductions += r.deduction || 0
          })
        }
      })

      const attendanceRate = totalEmployees > 0 && recordCount > 0
        ? Math.round((totalPresent / (recordCount * totalEmployees)) * 100)
        : 0

      const avgLateMinutes = totalLate > 0 ? Math.round(totalMinutes / totalLate) : 0

      return {
        center,
        totalEmployees,
        attendanceRate,
        avgLateMinutes,
        totalDeductions,
        rank: 0,
        trend: 'stable' as const,
        color: getCenterColor(center),
        icon: getCenterIcon(center)
      }
    })

    performances.sort((a, b) => {
      if (b.attendanceRate !== a.attendanceRate) return b.attendanceRate - a.attendanceRate
      if (a.avgLateMinutes !== b.avgLateMinutes) return a.avgLateMinutes - b.avgLateMinutes
      return a.totalDeductions - b.totalDeductions
    })

    performances.forEach((p, idx) => {
      p.rank = idx + 1
    })

    return performances
  }

  const performance = calculateCenterPerformance()
  const winner = performance[0]

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white"><Trophy className="inline mr-1" size={16} weight="fill" />المركز الأول</Badge>
    if (rank === 2) return <Badge className="bg-gray-400 text-white"><Medal className="inline mr-1" size={16} />المركز الثاني</Badge>
    return <Badge className="bg-orange-600 text-white"><Medal className="inline mr-1" size={16} />المركز الثالث</Badge>
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-5" dir={dir}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground min-h-[44px] px-3 text-lg"
          >
            {dir === 'rtl' ? '← ' : '→ '}{t('dashboard.backToDashboard')}
          </button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={32} weight="fill" className="text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              🏆 مقارنات الأداء بين المراكز
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            تصنيف المراكز حسب الأداء والالتزام - شهر {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {winner && (
          <Card className="mb-8 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{winner.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={28} weight="fill" className="text-yellow-600" />
                    <h2 className="text-xl md:text-2xl font-bold text-yellow-900">
                      المركز الأول - {winner.center}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1 text-green-700 font-bold">
                      <TrendUp size={20} weight="bold" />
                      نسبة حضور: {winner.attendanceRate}%
                    </div>
                    <div className="flex items-center gap-1 text-blue-700">
                      <Users size={20} weight="bold" />
                      {winner.totalEmployees} موظف
                    </div>
                    <div className="flex items-center gap-1 text-orange-700">
                      <Clock size={20} weight="bold" />
                      متوسط تأخير: {winner.avgLateMinutes} د
                    </div>
                  </div>
                </div>
              </div>
              <Medal size={80} weight="fill" className="text-yellow-500 opacity-20 md:opacity-100" />
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {performance.map((center, idx) => (
            <Card 
              key={center.center}
              className={`p-4 md:p-6 transition-all hover:scale-105 ${
                idx === 0 ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{center.icon}</div>
                {getRankBadge(center.rank)}
              </div>

              <h3 className="font-bold text-base md:text-lg mb-4 line-clamp-2">
                {center.center}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                    <TrendUp size={16} />
                    نسبة الحضور
                  </span>
                  <span className={`font-bold text-lg md:text-xl ${
                    center.attendanceRate >= 90 ? 'text-green-600' :
                    center.attendanceRate >= 70 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {center.attendanceRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                    <Users size={16} />
                    عدد الموظفين
                  </span>
                  <span className="font-bold text-lg md:text-xl text-blue-600">
                    {center.totalEmployees}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                    <Clock size={16} />
                    متوسط التأخير
                  </span>
                  <span className={`font-bold text-lg md:text-xl ${
                    center.avgLateMinutes === 0 ? 'text-green-600' :
                    center.avgLateMinutes <= 15 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {center.avgLateMinutes} د
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                    <Minus size={16} />
                    إجمالي الخصومات
                  </span>
                  <span className="font-bold text-lg md:text-xl text-red-600">
                    {center.totalDeductions} نقطة
                  </span>
                </div>
              </div>

              {idx === 0 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg text-center">
                  <p className="text-xs md:text-sm font-bold text-yellow-900">
                    🌟 المركز المتميز هذا الشهر
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="font-bold text-lg md:text-xl mb-4 flex items-center gap-2">
            <TrendUp size={24} className="text-primary" />
            نصائح لتحسين الأداء
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-sm md:text-base">
            <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
              <span className="text-green-600 font-bold">✓</span>
              <p>الحضور المبكر يعزز الإنتاجية ويرفع تصنيف المركز</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
              <span className="text-green-600 font-bold">✓</span>
              <p>الالتزام اليومي يقلل الخصومات ويحسن السمعة</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
              <span className="text-green-600 font-bold">✓</span>
              <p>المنافسة الشريفة تدفع الجميع للأفضل</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
              <span className="text-green-600 font-bold">✓</span>
              <p>العمل الجماعي المنضبط سر النجاح</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
