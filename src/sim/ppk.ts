// PPK (Pracownicze Plany Kapitałowe - Employee Capital Plans) Types
import type { Gender } from '@/const/genders'
import type { YearMonth } from './zus'

/**
 * PPK participation period
 */
export type PpkPeriod = {
    from: YearMonth
    to: YearMonth
    grossMonthlySalary: (year: number, month: number) => number
    /** Employee contribution rate (0.005 to 0.04, default 0.02) */
    employeeContributionRate: number
    /** Employer contribution rate (0.015 to 0.04, default 0.015) */
    employerContributionRate: number
}

/**
 * Configuration for PPK calculation
 */
export type PpkConfig = {
    ppkPeriods: PpkPeriod[]
    gender: Gender
    simStartYear: number
    retirementYear: number
    retirementMonth: number
    /** Yearly investment return coefficient. Default: 5% (1.05) */
    yearlyReturnCoef: (year: number) => number
    /** Age when participant joined PPK (affects welcome bonus eligibility) */
    ageWhenJoined: number
}

/**
 * Result of PPK calculation
 */
export type PpkResult = {
    totalMonthsParticipated: number
    totalEmployeeContributions: number
    totalEmployerContributions: number
    totalStateBonuses: number
    totalAccountBalanceAtRetirement: number
    retirementYear: number
}

// Constants
export const PPK_DEFAULT_EMPLOYEE_RATE = 0.02 // 2%
export const PPK_DEFAULT_EMPLOYER_RATE = 0.015 // 1.5%
export const PPK_WELCOME_BONUS = 250 // PLN
export const PPK_ANNUAL_SUBSIDY = 240 // PLN
export const PPK_MIN_EMPLOYEE_RATE = 0.005 // 0.5%
export const PPK_MAX_EMPLOYEE_RATE = 0.04 // 4%
export const PPK_MIN_EMPLOYER_RATE = 0.015 // 1.5%
export const PPK_MAX_EMPLOYER_RATE = 0.04 // 4%

// Helper functions
function yearMonthToMonthIndex(yearMonth: YearMonth, baseYear: number): number {
    return (yearMonth.year - baseYear) * 12 + (yearMonth.month - 1)
}

function monthIndexToYearMonth(monthIndex: number, baseYear: number): YearMonth {
    const year = baseYear + Math.floor(monthIndex / 12)
    const month = (monthIndex % 12) + 1
    return { year, month }
}

function isMonthInPeriod(yearMonth: YearMonth, period: PpkPeriod): boolean {
    const targetIndex = yearMonth.year * 12 + (yearMonth.month - 1)
    const periodStartIndex = period.from.year * 12 + (period.from.month - 1)
    const periodEndIndex = period.to.year * 12 + (period.to.month - 1)
    return targetIndex >= periodStartIndex && targetIndex <= periodEndIndex
}

function calculateParticipationMonths(periods: PpkPeriod[], baseYear: number): number {
    if (periods.length === 0) return 0
    
    // Convert periods to month ranges and merge overlapping ones
    const monthRanges: Array<{ start: number, end: number }> = []
    
    for (const period of periods) {
        const start = yearMonthToMonthIndex(period.from, baseYear)
        const end = yearMonthToMonthIndex(period.to, baseYear)
        monthRanges.push({ start, end })
    }
    
    // Sort by start month
    monthRanges.sort((a, b) => a.start - b.start)
    
    // Merge overlapping ranges
    const merged: Array<{ start: number, end: number }> = []
    if (monthRanges.length === 0) return 0
    
    let current = monthRanges[0]
    
    for (let i = 1; i < monthRanges.length; i++) {
        const next = monthRanges[i]
        if (next.start <= current.end + 1) {
            // Overlapping or adjacent - merge
            current.end = Math.max(current.end, next.end)
        } else {
            // No overlap - add current and move to next
            merged.push(current)
            current = next
        }
    }
    merged.push(current)
    
    // Count total months
    let totalMonths = 0
    for (const range of merged) {
        totalMonths += (range.end - range.start + 1)
    }
    return totalMonths
}

/**
 * Simulates PPK account accumulation over time
 */
function simulatePpkAccumulation(config: PpkConfig): {
    accountBalance: number
    totalEmployeeContributions: number
    totalEmployerContributions: number
    totalStateBonuses: number
} {
    let accountBalance = 0
    let totalEmployeeContributions = 0
    let totalEmployerContributions = 0
    let totalStateBonuses = 0
    
    // Welcome bonus (if joined before age 35)
    if (config.ageWhenJoined < 35) {
        accountBalance += PPK_WELCOME_BONUS
        totalStateBonuses += PPK_WELCOME_BONUS
    }
    
    // Track contributions per year for subsidy calculation
    const yearlyContributions: Record<number, number> = {}
    
    // Simulate month by month from start year to retirement
    const retirementMonthIndex = yearMonthToMonthIndex(
        { year: config.retirementYear, month: config.retirementMonth },
        config.simStartYear
    )
    
    for (let monthIndex = 0; monthIndex < retirementMonthIndex; monthIndex++) {
        const currentYearMonth = monthIndexToYearMonth(monthIndex, config.simStartYear)
        const year = currentYearMonth.year
        
        // Initialize year tracking if not exists
        if (!(year in yearlyContributions)) {
            yearlyContributions[year] = 0
        }
        
        // Add monthly contributions
        for (const period of config.ppkPeriods) {
            if (isMonthInPeriod(currentYearMonth, period)) {
                const grossSalary = period.grossMonthlySalary(currentYearMonth.year, currentYearMonth.month)
                
                const employeeContribution = grossSalary * period.employeeContributionRate
                const employerContribution = grossSalary * period.employerContributionRate
                
                accountBalance += employeeContribution + employerContribution
                totalEmployeeContributions += employeeContribution
                totalEmployerContributions += employerContribution
                
                yearlyContributions[year] += period.employeeContributionRate
                break // Only one contribution per month
            }
        }
    }
    
    // Calculate annual subsidies for complete years
    for (let year = config.simStartYear; year <= config.retirementYear - 1; year++) {
        // Check for annual subsidy (if contributed at least 2% for 12 months)
        const requiredRate = PPK_DEFAULT_EMPLOYEE_RATE * 12
        // Use small tolerance for floating-point comparison
        if (yearlyContributions[year] >= requiredRate - 1e-10) {
            accountBalance += PPK_ANNUAL_SUBSIDY
            totalStateBonuses += PPK_ANNUAL_SUBSIDY
        }
    }
    
    // Apply investment returns once at the end (simplified model)
    const yearsInvested = config.retirementYear - config.simStartYear
    for (let i = 0; i < yearsInvested; i++) {
        accountBalance *= config.yearlyReturnCoef(config.simStartYear + i)
    }
    
    return {
        accountBalance,
        totalEmployeeContributions,
        totalEmployerContributions,
        totalStateBonuses
    }
}

/**
 * Calculates PPK account balance and contributions
 */
export function calculatePpk(config: PpkConfig): PpkResult {
    const totalMonthsParticipated = calculateParticipationMonths(config.ppkPeriods, config.simStartYear)
    
    const {
        accountBalance,
        totalEmployeeContributions,
        totalEmployerContributions,
        totalStateBonuses
    } = simulatePpkAccumulation(config)
    
    return {
        totalMonthsParticipated,
        totalEmployeeContributions,
        totalEmployerContributions,
        totalStateBonuses,
        totalAccountBalanceAtRetirement: accountBalance,
        retirementYear: config.retirementYear
    }
}