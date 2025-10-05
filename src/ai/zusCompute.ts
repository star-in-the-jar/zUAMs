import { z } from 'zod'
import { calculateZusRetirement } from '@/sim/zus'
import { GENDERS } from '@/const/genders'
import type { AppState } from '@/store/appState'
import { prepareZusConfig } from '@/core/calculatePension'

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
 * Converts ZusCalculationInput to AppState format expected by prepareZusConfig
 */
function convertToAppState(input: ZusCalculationInput): AppState {
  return {
    pension: 0, // Not used in calculation
    lastValid: "", // Not used in calculation
    gender: input.gender,
    age: input.personAgeInYears,
    workSinceAge: input.personAgeInYears - input.yearsOfPriorWork,
    retirementAge: input.retirementAge,
    salary: input.grossMonthlySalary, // This might not be used
    maternityLeaves: Math.floor(input.monthsMaternityLeave / 6), // Convert months to periods (6 months each)
    monthlyGrossSalary: input.grossMonthlySalary,
    employmentType: input.jdgStartYear && input.yearsOnJdg && input.monthlyJdgZusContribution ? "JDG" : "UoP",
    averageSickDays: input.monthsLeave > 0, // If they have leave months, assume sick days
    additionalSavings: 0, // Not provided in simple input
    currentMonthlySalary: input.grossMonthlySalary,
    collectedZusBenefits: 0, // Not provided in simple input
    jdgStartYear: input.jdgStartYear,
    yearsOnJdg: input.yearsOnJdg,
    monthlyJdgZusContribution: input.monthlyJdgZusContribution,
  }
}

/**
 * AI-friendly ZUS retirement calculation function
 * Uses simPensionByStartingAfterYears logic with the improved prepareZusConfig function
 */
export function calculateZusRetirementSimple(input: ZusCalculationInput): ZusCalculationResult {
  // Convert input to AppState format expected by prepareZusConfig
  const appState = convertToAppState(input)
  
  // Use simPensionByStartingAfterYears approach: prepareZusConfig + calculateZusRetirement
  const config = prepareZusConfig(appState)
  const result = calculateZusRetirement(config)

  // Get base monthly retirement using the same logic as simPensionByStartingAfterYears
  const baseMonthlyRetirement = Math.round(result.monthlyRetirementAmount(0))
  
  // Calculate retirement amounts at different time points for easier AI consumption
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
