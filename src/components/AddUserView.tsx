import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, UserPlus } from '@phosphor-icons/react'
import { Employee, UserRole, Center } from '@/lib/types'
import { CENTERS } from '@/lib/attendance'
import { toast } from 'sonner'

interface AddUserViewProps {
  employees: Employee[]
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void
  onBack: () => void
}

export function AddUserView({ employees, onAddEmployee, onBack }: AddUserViewProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: '' as UserRole | '',
    center: '' as Center | '',
    salary: '',
    position: '',
    time: '08:00'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.password || !formData.name || !formData.role || !formData.center || !formData.salary || !formData.position) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    if (Array.isArray(employees) && employees.some(emp => emp.username === formData.username)) {
      toast.error('اسم المستخدم موجود بالفعل')
      return
    }

    const newEmployee: Omit<Employee, 'id'> = {
      username: formData.username,
      password: formData.password,
      name: formData.name,
      role: formData.role as UserRole,
      center: formData.center as Center,
      salary: parseFloat(formData.salary),
      position: formData.position,
      time: formData.time
    }

    onAddEmployee(newEmployee)

    setFormData({
      username: '',
      password: '',
      name: '',
      role: '',
      center: '',
      salary: '',
      position: '',
      time: '08:00'
    })

    toast.success('تم إضافة الموظف بنجاح')
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-5">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <Button variant="outline" onClick={onBack} className="self-start">
            <ArrowLeft className="ml-2" size={18} />
            <span className="text-sm md:text-base">العودة</span>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">إضافة موظف جديد</h1>
            <p className="text-sm md:text-base text-muted-foreground">أدخل بيانات الموظف الجديد</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <UserPlus className="text-indigo-600 flex-shrink-0" size={24} weight="duotone" />
              <div>
                <CardTitle className="text-lg md:text-xl">بيانات الموظف</CardTitle>
                <CardDescription className="text-sm md:text-base">املأ جميع الحقول المطلوبة لإضافة الموظف</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم *</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="أدخل اسم المستخدم"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">الاسم *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="أدخل الاسم"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">الدور *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مسؤول</SelectItem>
                      <SelectItem value="employee">موظف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="center">المركز *</Label>
                  <Select value={formData.center} onValueChange={(value) => handleInputChange('center', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المركز" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CENTERS.US}>{CENTERS.US}</SelectItem>
                      <SelectItem value={CENTERS.EU}>{CENTERS.EU}</SelectItem>
                      <SelectItem value={CENTERS.MAIN}>{CENTERS.MAIN}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">الوظيفة *</Label>
                  <Input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="أدخل الوظيفة"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">الراتب *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    placeholder="أدخل الراتب"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  <UserPlus className="ml-2" size={20} />
                  إضافة الموظف
                </Button>
                <Button type="button" variant="outline" onClick={onBack}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
