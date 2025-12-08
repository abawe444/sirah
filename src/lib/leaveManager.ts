import { LeaveRequest } from './types'

export function isEmployeeOnLeave(
  employeeId: number,
  date: string,
  leaveRequests: LeaveRequest[]
): { isOnLeave: boolean; leaveType?: string } {
  const approvedLeaves = leaveRequests.filter(
    req => req.employeeId === employeeId && req.status === 'موافق عليه'
  )

  for (const leave of approvedLeaves) {
    const leaveStart = new Date(leave.startDate)
    const leaveEnd = new Date(leave.endDate)
    const checkDate = new Date(date)

    if (checkDate >= leaveStart && checkDate <= leaveEnd) {
      return { isOnLeave: true, leaveType: leave.leaveType }
    }
  }

  return { isOnLeave: false }
}

export function getEmployeeLeaveDays(
  employeeId: number,
  month: number,
  year: number,
  leaveRequests: LeaveRequest[]
): { paidDays: number; unpaidDays: number } {
  let paidDays = 0
  let unpaidDays = 0

  const approvedLeaves = leaveRequests.filter(
    req => req.employeeId === employeeId && req.status === 'موافق عليه'
  )

  for (const leave of approvedLeaves) {
    const leaveStart = new Date(leave.startDate)
    const leaveEnd = new Date(leave.endDate)
    
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0)

    if (leaveEnd < monthStart || leaveStart > monthEnd) {
      continue
    }

    const overlapStart = leaveStart > monthStart ? leaveStart : monthStart
    const overlapEnd = leaveEnd < monthEnd ? leaveEnd : monthEnd
    
    const days = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1

    if (leave.leaveType === 'إجازة بدون راتب') {
      unpaidDays += days
    } else {
      paidDays += days
    }
  }

  return { paidDays, unpaidDays }
}
