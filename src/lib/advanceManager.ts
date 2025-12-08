import { Advance, Bonus, CustomDeduction } from './types'

export function calculateActiveAdvanceDeduction(
  employeeId: number,
  advances: Advance[]
): number {
  const activeAdvances = advances.filter(
    adv => adv.employeeId === employeeId && 
           adv.status === 'موافق عليه' && 
           adv.remainingInstallments > 0
  )

  return activeAdvances.reduce((sum, adv) => sum + (adv.monthlyDeduction || adv.monthlyInstallment || 0), 0)
}

export function getApprovedBonuses(
  employeeId: number,
  month: number,
  year: number,
  bonuses: Bonus[]
): number {
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0)

  return bonuses
    .filter(bonus => {
      if (bonus.employeeId !== employeeId || bonus.status !== 'موافق عليه') {
        return false
      }
      const bonusDate = new Date(bonus.date)
      return bonusDate >= monthStart && bonusDate <= monthEnd
    })
    .reduce((sum, bonus) => sum + bonus.amount, 0)
}

export function getActiveCustomDeductions(
  employeeId: number,
  customDeductions: CustomDeduction[]
): number {
  return customDeductions
    .filter(
      ded => ded.employeeId === employeeId && ded.status === 'نشط'
    )
    .reduce((sum, ded) => sum + ded.amount, 0)
}

export function processMonthlyAdvances(advances: Advance[]): Advance[] {
  return advances.map(advance => {
    if (advance.status === 'موافق عليه' && advance.remainingInstallments > 0) {
      return {
        ...advance,
        remainingInstallments: advance.remainingInstallments - 1
      }
    }
    return advance
  })
}

export function getTotalAdvanceAmount(employeeId: number, advances: Advance[]): number {
  return advances
    .filter(adv => adv.employeeId === employeeId && adv.status === 'موافق عليه')
    .reduce((sum, adv) => sum + adv.amount, 0)
}

export function getRemainingAdvanceAmount(employeeId: number, advances: Advance[]): number {
  return advances
    .filter(
      adv => adv.employeeId === employeeId && 
             adv.status === 'موافق عليه' && 
             adv.remainingInstallments > 0
    )
    .reduce((sum, adv) => sum + ((adv.monthlyDeduction || adv.monthlyInstallment || 0) * adv.remainingInstallments), 0)
}

export function getTotalBonusAmount(employeeId: number, bonuses: Bonus[]): number {
  return bonuses
    .filter(bonus => bonus.employeeId === employeeId && bonus.status === 'موافق عليه')
    .reduce((sum, bonus) => sum + bonus.amount, 0)
}
