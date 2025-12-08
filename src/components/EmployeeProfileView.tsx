import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Employee } from '@/lib/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { User, Camera, Briefcase, MapPin, CurrencyDollar, Calendar, IdentificationCard } from '@phosphor-icons/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface EmployeeProfileViewProps {
  user: Employee
  onBack: () => void
}

export function EmployeeProfileView({ user, onBack }: EmployeeProfileViewProps) {
  const { t, dir } = useLanguage()
  const [employees, setEmployees] = useKV<Employee[]>('employees', [])
  const [profileImage, setProfileImage] = useState<string | null>(user.profileImage || null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً. الحد الأقصى 5 ميجا')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('الملف المختار ليس صورة')
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    
    reader.onloadend = () => {
      const base64String = reader.result as string
      setProfileImage(base64String)
      
      setEmployees((current) =>
        (Array.isArray(current) ? current : []).map(emp =>
          emp.id === user.id ? { ...emp, profileImage: base64String } : emp
        )
      )
      
      toast.success('تم تحديث الصورة الشخصية بنجاح')
      setIsUploading(false)
    }
    
    reader.onerror = () => {
      toast.error('حدث خطأ أثناء تحميل الصورة')
      setIsUploading(false)
    }
    
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    
    setEmployees((current) =>
      (Array.isArray(current) ? current : []).map(emp =>
        emp.id === user.id ? { ...emp, profileImage: undefined } : emp
      )
    )
    
    toast.success('تم حذف الصورة الشخصية')
  }

  const getInitials = (name: string) => {
    const words = name.split(' ')
    if (words.length >= 2) {
      return words[0][0] + words[1][0]
    }
    return name.substring(0, 2)
  }

  const getCenterDisplayName = (center: string) => {
    if (center.includes('الامريكي')) return 'المركز الأمريكي 🇺🇸'
    if (center.includes('الاوربي')) return 'المركز الأوروبي 🇪🇺'
    return 'المركز الرئيسي 🏛️'
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-5 pb-20 md:pb-5" dir={dir}>
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-4 md:gap-6">
          <Card className="border-2 border-primary/20 overflow-hidden">
            <div className="h-24 md:h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 relative">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)'
              }} />
            </div>
            <CardContent className="pt-0 pb-4 md:pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-12 md:-mt-16">
                <div className="relative group">
                  <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-2xl ring-4 ring-primary/20">
                    <AvatarImage src={profileImage || undefined} alt={user.name} />
                    <AvatarFallback className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <label 
                    htmlFor="profile-image-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                  >
                    <Camera size={28} className="text-white" weight="duotone" />
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </div>

                <div className="flex-1 text-center md:text-right mb-2 md:mb-4">
                  <h1 className="text-xl md:text-3xl font-extrabold mb-1 md:mb-2">{user.name}</h1>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge className="text-xs md:text-sm" variant="secondary">
                      <Briefcase size={14} className={dir === 'rtl' ? 'ml-1' : 'mr-1'} />
                      {user.position}
                    </Badge>
                    <Badge className="text-xs md:text-sm" variant="outline">
                      <MapPin size={14} className={dir === 'rtl' ? 'ml-1' : 'mr-1'} />
                      {getCenterDisplayName(user.center)}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <label htmlFor="profile-image-upload">
                    <Button 
                      variant="outline" 
                      className="w-full min-h-[44px] text-sm"
                      disabled={isUploading}
                      asChild
                    >
                      <span>
                        <Camera className={dir === 'rtl' ? 'ml-2' : 'mr-2'} size={18} />
                        {isUploading ? 'جاري التحميل...' : 'تغيير الصورة'}
                      </span>
                    </Button>
                  </label>
                  {profileImage && (
                    <Button 
                      variant="destructive" 
                      onClick={handleRemoveImage}
                      className="w-full min-h-[44px] text-sm"
                      disabled={isUploading}
                    >
                      حذف الصورة
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-2 md:mb-3">
                  <IdentificationCard className="text-blue-600" size={20} weight="duotone" />
                </div>
                <CardTitle className="text-base md:text-lg">المعلومات الشخصية</CardTitle>
                <CardDescription className="text-xs md:text-sm">البيانات الأساسية للموظف</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-4">
                <div className="flex justify-between items-center p-2 md:p-3 bg-muted rounded-lg">
                  <span className="text-xs md:text-sm text-muted-foreground">رقم الموظف</span>
                  <span className="text-sm md:text-base font-bold">#{user.id}</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-muted rounded-lg">
                  <span className="text-xs md:text-sm text-muted-foreground">الاسم</span>
                  <span className="text-sm md:text-base font-bold">{user.name}</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-muted rounded-lg">
                  <span className="text-xs md:text-sm text-muted-foreground">المسمى الوظيفي</span>
                  <span className="text-sm md:text-base font-bold">{user.position}</span>
                </div>
                <div className="flex justify-between items-center p-2 md:p-3 bg-muted rounded-lg">
                  <span className="text-xs md:text-sm text-muted-foreground">المركز</span>
                  <span className="text-sm md:text-base font-semibold">{getCenterDisplayName(user.center)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-50 flex items-center justify-center mb-2 md:mb-3">
                  <CurrencyDollar className="text-green-600" size={20} weight="duotone" />
                </div>
                <CardTitle className="text-base md:text-lg">المعلومات المالية</CardTitle>
                <CardDescription className="text-xs md:text-sm">تفاصيل الراتب والمستحقات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-4">
                <div className="p-3 md:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <div className="text-xs md:text-sm text-muted-foreground mb-1">الراتب الأساسي</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-green-700">
                    {user.salary.toLocaleString('ar-SA')} 
                    <span className="text-sm md:text-lg mr-2">ريال</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {user.totalBonuses !== undefined && user.totalBonuses > 0 && (
                    <div className="flex justify-between items-center p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">إجمالي المكافآت</span>
                      <span className="text-sm md:text-base font-bold text-green-700">+{user.totalBonuses.toLocaleString('ar-SA')} ريال</span>
                    </div>
                  )}
                  
                  {user.totalAdvances !== undefined && user.totalAdvances > 0 && (
                    <div className="flex justify-between items-center p-2 md:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">إجمالي السلف</span>
                      <span className="text-sm md:text-base font-bold text-orange-700">-{user.totalAdvances.toLocaleString('ar-SA')} ريال</span>
                    </div>
                  )}
                  
                  {user.totalDeductions !== undefined && user.totalDeductions > 0 && (
                    <div className="flex justify-between items-center p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-xs md:text-sm text-muted-foreground">إجمالي الخصومات</span>
                      <span className="text-sm md:text-base font-bold text-red-700">-{user.totalDeductions.toLocaleString('ar-SA')} نقطة</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-2 md:mb-3">
                <User className="text-purple-600" size={20} weight="duotone" />
              </div>
              <CardTitle className="text-base md:text-lg">معلومات الحساب</CardTitle>
              <CardDescription className="text-xs md:text-sm">بيانات تسجيل الدخول</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-4">
              <div className="flex justify-between items-center p-2 md:p-3 bg-muted rounded-lg">
                <span className="text-xs md:text-sm text-muted-foreground">اسم المستخدم</span>
                <span className="text-sm md:text-base font-bold font-mono">{user.username}</span>
              </div>
              <div className="flex justify-between items-center p-2 md:p-3 bg-muted rounded-lg">
                <span className="text-xs md:text-sm text-muted-foreground">نوع الحساب</span>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs md:text-sm">
                  {user.role === 'admin' ? 'مسؤول' : 'موظف'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs md:text-sm text-blue-900">
              💡 <strong>نصيحة:</strong> يمكنك تحديث صورتك الشخصية بالضغط على الصورة أو زر "تغيير الصورة". الحد الأقصى لحجم الصورة 5 ميجا.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
