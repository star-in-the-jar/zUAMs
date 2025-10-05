import { z } from 'zod'
import { calculateZusRetirement, PeriodType } from '@/sim/zus'
import type { ZusRetirementConfig, EmploymentPeriod } from '@/sim/zus'
import { GENDERS } from '@/const/genders'

// Main ZUS calculation input schema - supports both UoP and JDG employment periods
// Note: Use realistic dates (current year ±50 years), typical Polish salaries (3000-20000 PLN), standard retirement age (60-67)
// UWAGA: Urlopy macierzyńskie i zwolnienia chorobowe (L4) mogą wpłynąć na wynik kalkulacji emerytury
export const ZusCalculationInputSchema = z.object({
  // Employment period details - UoP (Umowa o Pracę)
  workStartYear: z.number().int().min(1950).max(2100).describe('Year when employment starts (use realistic dates, typically 20-30 years ago from current date)'),
  yearsOfPriorWork: z.number().int().min(0).max(50).describe('Number of years the person has already worked so far (prior to today)'),
  grossMonthlySalary: z.number().positive().max(100000).describe('Fixed gross monthly salary in PLN (typical range: 3000-20000)'),
  
  // JDG (Jednoosobowa Działalność Gospodarcza) - Self-employment details
  jdgStartYear: z.number().int().min(1950).max(2100).optional().describe('Year when JDG (self-employment) starts. Optional - if not provided, JDG period is not included'),
  yearsOnJdg: z.number().int().min(0).max(50).optional().describe('Number of years on JDG (self-employment). Optional - if not provided, JDG period is not included'),
  monthlyJdgZusContribution: z.number().min(1646.47).max(50000).optional().describe('Monthly ZUS contribution for JDG in PLN. Must be at least 1646.47 PLN (minimum base). Optional - if not provided, JDG period is not included'),
  
  gender: z.enum([GENDERS.MALE, GENDERS.FEMALE]).describe('Gender affects retirement requirements (MALE retirement at 65, FEMALE at 60)'),
  personAgeInYears: z.number().int().min(18).max(100).describe('Current age of the person in years'),
  retirementAge: z.number().int().min(50).max(80).describe('Age when retirement begins (typical retirement age: 60-67)'),
  monthsOfStudying: z.number().int().min(0).max(96).default(0).describe('Months of studying - counted towards retirement but no contributions. Capped at 8 years (96 months)'),
  monthsMaternityLeave: z.number().int().min(0).max(120).default(0).describe('Months of maternity leave - counted towards retirement but no contributions'),
  monthsLeave: z.number().int().min(0).max(600).default(0).describe('Months of leave - periods not contributing to ZUS.'),
  yearlyValorization: z.number().positive().default(1.025).describe('Fixed yearly valorization coefficient (default: 1.025 = 2.5%)'),
  yearlyRetirementValorization: z.number().positive().default(1.025).describe('Fixed yearly retirement valorization (default: 1.025 = 2.5%)')
})

export type ZusCalculationInput = z.infer<typeof ZusCalculationInputSchema>

// Output schema
export const ZusCalculationResultSchema = z.object({
  totalMonthsContributed: z.number().int().describe('Total months counted towards retirement'),
  totalZusAccountBalanceAtTimeOfRetirement: z.number().describe('Total ZUS account balance at retirement in PLN'),
  retirementYear: z.number().int().describe('Year of retirement'),
  isEligibleForMinimalRetirement: z.boolean().describe('Whether eligible for minimal retirement (25 years for men, 20 for women)'),
  baseMonthlyRetirement: z.number().describe('Base monthly retirement amount in PLN (at retirement start)'),
  monthlyRetirementAfter1Year: z.number().describe('Monthly retirement amount after 1 year (with valorization)'),
  monthlyRetirementAfter5Years: z.number().describe('Monthly retirement amount after 5 years (with valorization)'),
  monthlyRetirementAfter10Years: z.number().describe('Monthly retirement amount after 10 years (with valorization)')
})

export type ZusCalculationResult = z.infer<typeof ZusCalculationResultSchema>

/**
 * AI-friendly ZUS retirement calculation function
 * Converts simple input parameters into the complex ZUS calculation configuration
 * and provides commonly needed retirement amounts at different time points
 */
export function calculateZusRetirementSimple(input: ZusCalculationInput): ZusCalculationResult {
  // Calculate retirement year based on current age and retirement age
  const yearsUntilRetirement = input.retirementAge - input.personAgeInYears
  const retirementYear = 2025 + yearsUntilRetirement
  
  // Calculate work end year (assume they work until retirement)
  const workEndYear = retirementYear

  // Calculate total years of work (past + future until retirement)
  const totalYearsOfWork = input.yearsOfPriorWork + yearsUntilRetirement
  
  // Calculate sick leave coefficient to reduce effective salary
  const totalMonthsWorked = totalYearsOfWork * 12
  const sickLeaveCoef = Math.max(0, 1 - (input.monthsLeave / totalMonthsWorked))
  const adjustedGrossSalary = input.grossMonthlySalary * sickLeaveCoef

  // Create employment periods array
  const employmentPeriods: EmploymentPeriod[] = []

  // Add UoP employment period
  const uopEmploymentPeriod: EmploymentPeriod = {
    type: PeriodType.UOP,
    from: { year: input.workStartYear, month: 1 }, // Always use January as fallback
    to: { year: workEndYear, month: 1 }, // Always use January as fallback
    grossMonthlySalary: () => adjustedGrossSalary // Use adjusted salary accounting for sick leave
  }
  employmentPeriods.push(uopEmploymentPeriod)

  // Add JDG employment period if all required JDG fields are provided
  if (input.jdgStartYear && input.yearsOnJdg && input.monthlyJdgZusContribution) {
    const jdgEndYear = input.jdgStartYear + input.yearsOnJdg
    const jdgEmploymentPeriod: EmploymentPeriod = {
      type: PeriodType.SELF_EMPLOYED,
      from: { year: input.jdgStartYear, month: 1 },
      to: { year: jdgEndYear, month: 1 },
      monthlyZusContribution: () => input.monthlyJdgZusContribution!
    }
    employmentPeriods.push(jdgEmploymentPeriod)
  }

  // Calculate gender-dependent average life expectancy in months
  // Men: average life expectancy ~76 years, Women: ~82 years
  const averageLifeExpectancyMonths = input.gender === GENDERS.MALE ? 76 * 12 : 82 * 12
  
  // Calculate months alive after retirement (life expectancy - retirement age)
  const avgMonthsAliveAfterRetirement = Math.max(1, averageLifeExpectancyMonths - (input.retirementAge * 12))

  // Convert simple input to complex ZUS config
  // Note: monthsSickLeave is captured in input but not directly used in current ZUS calculation
  // Sick leave periods typically don't contribute to ZUS but also don't count as non-contributing periods
  const config: ZusRetirementConfig = {
    employmentPeriods,
    gender: input.gender,
    simStartYear: 2000,
    retirementYear,
    retirementMonth: 1, 
    avgMonthsAliveAfterRetirement,
    monthsOfStudying: input.monthsOfStudying,
    monthsMaternityLeave: input.monthsMaternityLeave,
    yearlyValorizationCoef: () => input.yearlyValorization, // Convert to function
    yearlyRetirementValorizationMul: () => input.yearlyRetirementValorization, // Convert to function
    additionalSavings: 0, // Not used in simple calculation
    yearlyAdditionalSavingsValorizationMul: () => 1.025, // Default valorization
    collectedZusBenefits: 0, // Not used in simple calculation
    averageSickDays: false // Not used in simple calculation
  }

  // Calculate using the complex ZUS function
  const result = calculateZusRetirement(config)

  // Calculate retirement amounts at different time points for easier AI consumption
  const baseMonthlyRetirement = result.monthlyRetirementAmount(0)
  const monthlyRetirementAfter1Year = result.monthlyRetirementAmount(12)
  const monthlyRetirementAfter5Years = result.monthlyRetirementAmount(60)
  const monthlyRetirementAfter10Years = result.monthlyRetirementAmount(120)

  return {
    totalMonthsContributed: result.totalMonthsContributed,
    totalZusAccountBalanceAtTimeOfRetirement: result.totalZusAccountBalanceAtTimeOfRetirement,
    retirementYear: result.retirementYear,
    isEligibleForMinimalRetirement: result.isEligibleForMinimalRetirement,
    baseMonthlyRetirement,
    monthlyRetirementAfter1Year,
    monthlyRetirementAfter5Years,
    monthlyRetirementAfter10Years
  }
}
