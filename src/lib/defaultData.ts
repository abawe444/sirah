import { Employee } from './types'
import { CENTERS } from './attendance'

export const defaultEmployees: Omit<Employee, 'id'>[] = [
  { name: "المسؤول", center: CENTERS.MAIN, time: "", salary: 10000, position: "مسؤول", username: "admin", role: "admin" },
  
  { name: "الشيخ", center: CENTERS.US, time: "", salary: 3500, position: "موظف", username: "sheikh", role: "employee" },
  { name: "وداعة", center: CENTERS.US, time: "", salary: 3200, position: "موظف", username: "wadaa", role: "employee" },
  { name: "شعبان", center: CENTERS.US, time: "", salary: 3400, position: "موظف", username: "shaaban", role: "employee" },
  { name: "ذهيب", center: CENTERS.US, time: "", salary: 3300, position: "موظف", username: "dhahib", role: "employee" },
  { name: "مصعب (مدير)", center: CENTERS.US, time: "", salary: 5000, position: "مدير", username: "musab", role: "employee" },
  { name: "عنايات", center: CENTERS.US, time: "", salary: 3100, position: "موظف", username: "inayat", role: "employee" },
  
  { name: "شريف", center: CENTERS.EU, time: "", salary: 3600, position: "موظف", username: "sharif", role: "employee" },
  { name: "جوزيف", center: CENTERS.EU, time: "", salary: 3500, position: "موظف", username: "joseph", role: "employee" },
  { name: "صابر", center: CENTERS.EU, time: "", salary: 3400, position: "موظف", username: "saber", role: "employee" },
  { name: "إسكندر", center: CENTERS.EU, time: "", salary: 3300, position: "موظف", username: "iskandar", role: "employee" },
  { name: "بخاري", center: CENTERS.EU, time: "", salary: 3800, position: "فني", username: "bukhari", role: "employee" },
  { name: "أحمد كهربائي", center: CENTERS.EU, time: "", salary: 4000, position: "كهربائي", username: "ahmed_elec", role: "employee" },
  { name: "محمد بلال", center: CENTERS.EU, time: "", salary: 3200, position: "موظف", username: "bilal", role: "employee" },
  { name: "وسيم", center: CENTERS.EU, time: "", salary: 3300, position: "موظف", username: "waseem", role: "employee" },
  { name: "أبو سليمان (مدير)", center: CENTERS.EU, time: "", salary: 5200, position: "مدير", username: "sulaiman", role: "employee" },

  { name: "عبد الله", center: CENTERS.MAIN, time: "", salary: 3700, position: "موظف", username: "abdullah", role: "employee" },
  { name: "أبو بشير", center: CENTERS.MAIN, time: "", salary: 3400, position: "موظف", username: "bashir", role: "employee" },
  { name: "أمجد (مدير)", center: CENTERS.MAIN, time: "", salary: 5500, position: "مدير", username: "amjad", role: "employee" },
  { name: "نجيب", center: CENTERS.MAIN, time: "", salary: 3300, position: "موظف", username: "najeeb", role: "employee" },
  { name: "أيمن", center: CENTERS.MAIN, time: "", salary: 3500, position: "موظف", username: "ayman", role: "employee" },
  { name: "لطيف", center: CENTERS.MAIN, time: "", salary: 3200, position: "موظف", username: "lateef", role: "employee" },
  { name: "محمد سمكري", center: CENTERS.MAIN, time: "", salary: 3900, position: "سمكري", username: "mohammed_sam", role: "employee" },
  { name: "شاهد", center: CENTERS.MAIN, time: "", salary: 3400, position: "موظف", username: "shahid", role: "employee" },
  { name: "مهند (محاسب)", center: CENTERS.MAIN, time: "", salary: 4500, position: "محاسب", username: "mohannad", role: "employee" },
  { name: "زاهر", center: CENTERS.MAIN, time: "", salary: 3600, position: "موظف", username: "zaher", role: "employee" }
]
