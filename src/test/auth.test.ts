import { describe, it, expect } from 'vitest'
import { authenticateEmployee } from '../lib/auth'
import { defaultEmployees } from '../lib/defaultData'

describe('authenticateEmployee', () => {
  it('should authenticate valid admin user', () => {
    const result = authenticateEmployee('admin', 'secure123!', defaultEmployees.map((emp, index) => ({ ...emp, id: index + 1 })))
    expect(result).toBeTruthy()
    expect(result?.username).toBe('admin')
    expect(result?.role).toBe('admin')
  })

  it('should authenticate valid employee user', () => {
    const result = authenticateEmployee('sheikh', 'secure123!', defaultEmployees.map((emp, index) => ({ ...emp, id: index + 1 })))
    expect(result).toBeTruthy()
    expect(result?.username).toBe('sheikh')
    expect(result?.role).toBe('employee')
  })

  it('should return null for invalid username', () => {
    const result = authenticateEmployee('invalid', 'secure123!', defaultEmployees.map((emp, index) => ({ ...emp, id: index + 1 })))
    expect(result).toBeNull()
  })

  it('should return null for invalid password', () => {
    const result = authenticateEmployee('admin', 'wrong', defaultEmployees.map((emp, index) => ({ ...emp, id: index + 1 })))
    expect(result).toBeNull()
  })

  it('should return null for empty credentials', () => {
    const result = authenticateEmployee('', '', defaultEmployees.map((emp, index) => ({ ...emp, id: index + 1 })))
    expect(result).toBeNull()
  })

  it('should be case insensitive for username', () => {
    const result = authenticateEmployee('ADMIN', 'secure123!', defaultEmployees.map((emp, index) => ({ ...emp, id: index + 1 })))
    expect(result).toBeTruthy()
    expect(result?.username).toBe('admin')
  })
})