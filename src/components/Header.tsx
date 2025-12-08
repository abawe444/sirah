import { useEffect, useState } from 'react'

export function Header() {
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      
      setCurrentTime(now.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
      }))
      
      setCurrentDate(now.toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }))
    }
    
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4 md:mb-5 bg-gradient-to-br from-primary to-primary/80 p-3 md:p-6 rounded-lg md:rounded-xl text-white shadow-lg">
      <div className="flex items-center gap-2 md:gap-5 w-full md:w-auto">
        <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg flex-shrink-0">
          <svg width="36" height="36" viewBox="0 0 100 100" className="md:w-12 md:h-12">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#f59e0b', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            <path d="M 25,50 L 50,25 L 75,50 L 50,35 L 25,50 Z" fill="url(#logoGradient)" stroke="#92400e" strokeWidth="2"/>
            <path d="M 35,60 L 60,35 L 85,60 L 60,45 L 35,60 Z" fill="url(#logoGradient)" stroke="#92400e" strokeWidth="2" opacity="0.8"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base md:text-3xl font-extrabold m-0 truncate">نظام صرح الإتقان المتكامل</h1>
          <p className="mt-0.5 md:mt-1 opacity-90 text-xs md:text-base truncate">
            الحضور والانصراف والرواتب | {currentDate}
          </p>
        </div>
      </div>
      <div className="text-xl md:text-3xl font-extrabold self-end md:self-center">
        {currentTime}
      </div>
    </div>
  )
}
