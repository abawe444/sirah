import { Employee } from '@/lib/types'
import { calculateStats, translations } from '@/lib/attendance'
import { Badge } from '@/components/ui/badge'

interface MultiLanguageTableProps {
  employees: Employee[]
  language: 'urdu' | 'hindi'
  title: string
}

export function MultiLanguageTable({ employees, language, title }: MultiLanguageTableProps) {
  const tableClass = language === 'urdu' ? 'lang-urdu' : 'lang-hindi'

  return (
    <div className="mb-6">
      <h3 className="text-lg font-extrabold mb-2 text-primary border-r-4 border-primary pr-2 bg-accent p-2 rounded">
        {title}
      </h3>
      
      <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
        <div className="bg-accent p-4 border-b-2 border-primary/30 text-sm font-semibold">
          <div className="mb-2 font-extrabold text-primary">
            {language === 'urdu' ? '📋 کٹوتی کے اصول:' : '📋 कटौती के नियम:'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <div>
              ⏰ {language === 'urdu' ? '08:30 تک' : '08:30 तक'} - 
              <span className="text-success font-extrabold"> {language === 'urdu' ? 'کوئی کٹوتی نہیں' : 'कोई कटौती नहीं'}</span>
            </div>
            <div>
              ⏰ 08:31 - 08:40 - 
              <span className="text-warning font-extrabold"> {language === 'urdu' ? '10 ریال' : '10 रियाल'}</span>
            </div>
            <div>
              ⏰ 08:41 - 08:50 - 
              <span className="text-warning font-extrabold"> {language === 'urdu' ? '15 ریال' : '15 रियाल'}</span>
            </div>
            <div>
              ⏰ 08:51 - 09:00 - 
              <span className="text-danger font-extrabold"> {language === 'urdu' ? '25 ریال' : '25 रियाल'}</span>
            </div>
            <div>
              ⏰ {language === 'urdu' ? '09:00 کے بعد' : '09:00 के बाद'} - 
              <span className="text-danger font-extrabold"> {language === 'urdu' ? '45 ریال' : '45 रियाल'}</span>
            </div>
          </div>
        </div>
        
        <table className={`w-full ${tableClass}`}>
          <thead className="bg-accent">
            <tr>
              <th className="p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">
                {language === 'urdu' ? 'ملازم (Employee)' : 'Employee (कर्मचारी)'}
              </th>
              <th className="p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">
                {language === 'urdu' ? 'مرکز (Center)' : 'Center (केंद्र)'}
              </th>
              <th className="p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">
                {language === 'urdu' ? 'وقت (Time)' : 'Time (समय)'}
              </th>
              <th className="p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">
                {language === 'urdu' ? 'تاخیر (Delay)' : 'Delay (देरी)'}
              </th>
              <th className="p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">
                {language === 'urdu' ? 'کٹوتی (Ded.)' : 'Ded. (कटौती)'}
              </th>
              <th className="p-3 text-center font-extrabold text-primary border-b-2 border-primary/30">
                {language === 'urdu' ? 'حالت (Status)' : 'Status (स्थिति)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const calc = calculateStats(emp.time)
              const centerClass = emp.center.includes("الامريكي") 
                ? "bg-blue-100 text-blue-900" 
                : emp.center.includes("الاوربي")
                ? "bg-orange-100 text-orange-900"
                : "bg-green-100 text-green-900"

              const statusClass = calc.style === "ok" 
                ? "bg-green-100 text-green-900" 
                : calc.style === "late"
                ? "bg-yellow-100 text-yellow-900"
                : "bg-red-100 text-red-900"

              return (
                <tr key={emp.id} className="border-b border-border">
                  <td className="p-2 text-center font-semibold">
                    {emp.name}
                  </td>
                  <td className="p-2 text-center">
                    <Badge className={`${centerClass} font-bold text-xs`}>
                      {translations.centers[emp.center]?.[language] || emp.center}
                    </Badge>
                  </td>
                  <td className="p-2 text-center font-semibold" dir="ltr">
                    {emp.time}
                  </td>
                  <td className="p-2 text-center font-bold">
                    {calc.delay}
                  </td>
                  <td className="p-2 text-center font-bold">
                    {calc.deduction}
                  </td>
                  <td className="p-2 text-center">
                    <Badge className={`${statusClass} font-extrabold text-xs px-3 py-1`}>
                      {translations.status[calc.status as keyof typeof translations.status]?.[language] || calc.status}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
