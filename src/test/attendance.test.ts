import { describe, it, expect } from 'vitest'
import { calculateStats } from '../lib/attendance'

describe('calculateStats', () => {
  it('should calculate attendance correctly for on-time employee', () => {
    const result = calculateStats('08:00')
    expect(result.delay).toBe(0)
    expect(result.deduction).toBe(0)
    expect(result.status).toBe('مبكر')
    expect(result.style).toBe('ok')
  })

  it('should calculate late attendance correctly', () => {
    const result = calculateStats('08:35')
    expect(result.delay).toBe(35)
    expect(result.deduction).toBe(10)
    expect(result.status).toBe('تأخير')
    expect(result.style).toBe('late')
  })

  it('should calculate severe late attendance correctly', () => {
    const result = calculateStats('08:55')
    expect(result.delay).toBe(55)
    expect(result.deduction).toBe(25)
    expect(result.status).toBe('تأخير شديد')
    expect(result.style).toBe('vlate')
  })

  it('should handle early arrival correctly', () => {
    const result = calculateStats('07:45')
    expect(result.delay).toBe(0)
    expect(result.deduction).toBe(0)
    expect(result.status).toBe('مبكر')
    expect(result.style).toBe('ok')
  })

  it('should cap maximum deduction', () => {
    const result = calculateStats('09:30')
    expect(result.deduction).toBe(45)
  })

  it('should handle empty time string', () => {
    const result = calculateStats('')
    expect(result.delay).toBe(0)
    expect(result.deduction).toBe(0)
    expect(result.status).toBe('غير محدد')
    expect(result.style).toBe('ok')
  })
})