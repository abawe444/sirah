import { AttendanceCalculation, AttendanceStatus } from './types'

export function calculateStats(timeStr: string): AttendanceCalculation {
  if (!timeStr) {
    return { 
      delay: 0, 
      deduction: 0, 
      lateMinutes: 0,
      status: "غير محدد" as any, 
      style: "ok" 
    }
  }
  
  const [h, m] = timeStr.split(':').map(Number)
  const total = h * 60 + m
  const start = 8 * 60
  const grace = 8 * 60 + 30

  let delay = 0
  let deduction = 0
  let status: AttendanceStatus | "مبكر" | "تأخير شديد" = "حضور"
  let style = "ok"

  if (total > start) delay = total - start

  if (total <= grace) {
    deduction = 0
    status = total <= start ? "مبكر" : "حضور"
    style = "ok"
  } else {
    style = "late"
    status = "تأخير"
    if (total <= grace + 10) {
      deduction = 10
    } else if (total <= grace + 20) {
      deduction = 15
    } else if (total <= grace + 30) {
      deduction = 25
      style = "vlate"
      status = "تأخير شديد"
    } else {
      deduction = 45
      style = "vlate"
      status = "تأخير شديد"
    }
  }
  
  return { delay, deduction, lateMinutes: delay, status, style }
}

export const CENTERS = {
  US: "صرح الاتقان الامريكي 1" as const,
  EU: "صرح الاتقان الاوربي 2" as const,
  MAIN: "صرح الاتقان الرئيسي" as const,
}

export const centerOrder = [CENTERS.US, CENTERS.EU, CENTERS.MAIN]

export const translations = {
  centers: {
    "صرح الاتقان الامريكي 1": { urdu: "مرکز 1", hindi: "केंद्र 1" },
    "صرح الاتقان الاوربي 2": { urdu: "مرکز 2", hindi: "केंद्र 2" },
    "صرح الاتقان الرئيسي": { urdu: "مرکزی دفتر", hindi: "मुख्य कार्यालय" }
  },
  status: {
    "حضور": { urdu: "حاضر", hindi: "उपस्थित" },
    "مبكر": { urdu: "حاضر", hindi: "उपस्थित" },
    "تأخير": { urdu: "تاخیر", hindi: "देरी" },
    "تأخير شديد": { urdu: "تاخیر زیاده", hindi: "अधिक देरी" },
    "غائب": { urdu: "غیر حاضر", hindi: "अनुपस्थित" }
  }
}
