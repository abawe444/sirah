import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, ChartLine, CheckCircle, Power } from '@phosphor-icons/react'
import { Employee } from '@/lib/types'

interface ManagerDashboardProps {
  user: Employee
  onLogout: () => void
}

export function ManagerDashboard({ user, onLogout }: ManagerDashboardProps) {
  return (
    <div className="min-h-screen bg-background p-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">لوحة تحكم المدير</h1>
            <p className="text-muted-foreground">مرحباً، {user.name}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <Power className="ml-2" size={20} />
            تسجيل الخروج
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                <Users className="text-blue-600" size={24} weight="duotone" />
              </div>
              <CardTitle>فريق العمل</CardTitle>
              <CardDescription>عدد الموظفين التابعين</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">12 موظف</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-3">
                <CheckCircle className="text-green-600" size={24} weight="duotone" />
              </div>
              <CardTitle>معدل الحضور</CardTitle>
              <CardDescription>نسبة الالتزام بالمواعيد</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">94%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
                <ChartLine className="text-orange-600" size={24} weight="duotone" />
              </div>
              <CardTitle>الأداء الشهري</CardTitle>
              <CardDescription>تقييم أداء الفريق</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">جيد جداً</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>التقارير والموافقات</CardTitle>
            <CardDescription>الإجراءات المعلقة التي تحتاج موافقة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">طلب إجازة - عبد الله</p>
                  <p className="text-sm text-muted-foreground">إجازة سنوية لمدة 3 أيام</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">رفض</Button>
                  <Button size="sm">موافقة</Button>
                </div>
              </div>
              <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">طلب سلفة - محمد</p>
                  <p className="text-sm text-muted-foreground">مبلغ 500 ريال</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">رفض</Button>
                  <Button size="sm">موافقة</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
