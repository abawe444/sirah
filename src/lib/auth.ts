import { Employee, UserRole } from './types'

export function authenticateEmployee(
  username: string,
  password: string,
  employees: Employee[]
): Employee | null {
  if (!username || !password) {
    return null
  }

  // For demo purposes, use a default password. In production, use proper authentication
  const defaultPassword = process.env.DEFAULT_PASSWORD || 'secure123!'

  if (password !== defaultPassword) {
    return null
  }

  const employee = employees.find(
    emp => emp.username?.toLowerCase() === username.toLowerCase()
  )

  return employee || null
}