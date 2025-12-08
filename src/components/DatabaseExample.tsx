import { useState } from 'react'
import { useUsers } from '@/lib/database'
import { toast } from 'sonner'

export function DatabaseExample() {
  const { data: usersData, loading: empLoading, addItem, updateItem, removeItem } = useUsers()
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    salary: 0,
    center: '',
    username: '',
    password: ''
  })

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.position) {
      toast.error('❌ يجب ملء جميع الحقول')
      return
    }

    const employee = {
      id: usersData?.nextId || 1,
      ...newEmployee,
      nameHindi: '',
      email: `${newEmployee.username}@company.com`,
      time: '08:00',
      role: 'employee' as const,
      totalAdvances: 0,
      totalBonuses: 0,
      totalDeductions: 0,
      profileImage: '/data/images/default.jpg'
    }

    try {
      await addItem(employee, 'users')
      toast.success('✅ تم إضافة الموظف بنجاح')
      setNewEmployee({
        name: '',
        position: '',
        salary: 0,
        center: '',
        username: '',
        password: ''
      })
    } catch {
      toast.error('❌ فشل إضافة الموظف')
    }
  }

  const handleUpdateEmployee = async (id: number) => {
    try {
      await updateItem(id, { position: 'مدير جديد' }, 'users')
      toast.success('✅ تم تحديث الموظف')
    } catch {
      toast.error('❌ فشل التحديث')
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    try {
      await removeItem(id, 'users')
      toast.success('✅ تم حذف الموظف')
    } catch {
      toast.error('❌ فشل الحذف')
    }
  }

  if (empLoading) return <div className="text-center py-8">جاري التحميل...</div>

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">إدارة الموظفين</h1>

      {/* نموذج إضافة موظف */}
      <div className="bg-white border rounded-lg p-6 shadow">
        <h2 className="text-xl font-bold mb-4">إضافة موظف جديد</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="الاسم"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="الوظيفة"
            value={newEmployee.position}
            onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="الراتب"
            value={newEmployee.salary}
            onChange={(e) => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="المركز"
            value={newEmployee.center}
            onChange={(e) => setNewEmployee({...newEmployee, center: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={newEmployee.username}
            onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
            className="border rounded px-3 py-2"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            value={newEmployee.password}
            onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={handleAddEmployee}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          إضافة موظف
        </button>
      </div>

      {/* قائمة الموظفين */}
      <div className="bg-white border rounded-lg p-6 shadow overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">قائمة الموظفين</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border">
              <th className="border p-3 text-right">المعرف</th>
              <th className="border p-3 text-right">الاسم</th>
              <th className="border p-3 text-right">الوظيفة</th>
              <th className="border p-3 text-right">الراتب</th>
              <th className="border p-3 text-right">المركز</th>
              <th className="border p-3 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {usersData?.users.map((emp) => (
              <tr key={emp.id} className="border hover:bg-gray-50">
                <td className="border p-3">{emp.id}</td>
                <td className="border p-3">{emp.name}</td>
                <td className="border p-3">{emp.position}</td>
                <td className="border p-3">{emp.salary.toLocaleString('ar-SA')}</td>
                <td className="border p-3">{emp.center}</td>
                <td className="border p-3 space-x-2">
                  <button
                    onClick={() => handleUpdateEmployee(emp.id)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(emp.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-gray-600 mt-4">إجمالي الموظفين: {usersData?.users.length}</p>
      </div>

      {/* معلومات النظام */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-3">📊 معلومات النظام</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">عدد الموظفين:</p>
            <p className="text-2xl font-bold text-blue-600">{usersData?.users.length}</p>
          </div>
          <div>
            <p className="text-gray-600">عدد الإداريين:</p>
            <p className="text-2xl font-bold text-blue-600">{usersData?.users.filter(u => u.role === 'admin').length}</p>
          </div>
          <div>
            <p className="text-gray-600">معرف الموظف التالي:</p>
            <p className="text-2xl font-bold text-blue-600">{usersData?.nextId}</p>
          </div>
          <div>
            <p className="text-gray-600">إجمالي الرواتب:</p>
            <p className="text-2xl font-bold text-blue-600">
              {usersData?.users
                .reduce((sum, emp) => sum + emp.salary, 0)
                .toLocaleString('ar-SA')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
