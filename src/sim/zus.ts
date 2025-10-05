// ZUS Retirement Calculator Types
import type { Gender } from '@/const/genders'
import { GENDERS } from '@/const/genders'
import { MINIMAL_PENSION } from '@/const/pension'

/**
 * Period types for employment
 */
export const PeriodType = {
    UOP: 'uop',
    SELF_EMPLOYED: 'self-employed'
} as const

export type PeriodType = typeof PeriodType[keyof typeof PeriodType]

/**
 * Represents a date with year and month (1-indexed)
 */
export type YearMonth = {
    year: number
    month: number // 1-12
}

/**
 * Employment period for UoP (Umowa o Pracę - Employment Contract)
 */
export type UoPPeriod = {
    type: typeof PeriodType.UOP
    from: YearMonth
    to: YearMonth
    grossMonthlySalary: (year: number, month: number) => number // ZUS contribution: 9.76% of gross salary
}

/**
 * Self-employment period with arbitrary ZUS contributions
 */
export type SelfEmploymentPeriod = {
    type: typeof PeriodType.SELF_EMPLOYED
    from: YearMonth
    to: YearMonth
    monthlyZusContribution: (year: number, month: number) => number // arbitrary amount
}

/**
 * Tagged union of employment periods
 */
export type EmploymentPeriod = UoPPeriod | SelfEmploymentPeriod

/**
 * Configuration for ZUS retirement calculation
 */
export type ZusRetirementConfig = {
    employmentPeriods: EmploymentPeriod[]
    gender: Gender
    simStartYear: number
    retirementYear: number
    retirementMonth: number
    avgMonthsAliveAfterRetirement: number
    /** Months of studying - counted towards retirement but no contributions. Capped at 8 years (96 months) */
    monthsOfStudying: number
    /** Months of maternity leave - counted towards retirement but no contributions */
    monthsMaternityLeave: number
    /** Yearly valorization coefficient for account balance. Default: fixed 2.5% (1.025) */
    yearlyValorizationCoef: (year: number) => number
    /** Yearly valorization multiplier for retirement payments. Default: fixed 2.5% (1.025) */
    yearlyRetirementValorizationMul: (yearFromStart: number) => number
    /** Additional savings - counted towards retirement but no contributions */
    additionalSavings: number
    yearlyAdditionalSavingsValorizationMul: (yearFromStart: number) => number
    collectedZusBenefits: number
    averageSickDays: boolean
}

/**
 * Result of ZUS retirement calculation
 */
export type ZusRetirementResult = {
    totalMonthsContributed: number
    totalZusAccountBalanceAtTimeOfRetirement: number
    retirementYear: number
    isEligibleForMinimalRetirement: boolean
    /** Function that returns monthly retirement amount for given months after retirement start */
    monthlyRetirementAmount: (monthsAfterRetirementStart: number) => number
}

// Constants
export const ZUS_UOP_CONTRIBUTION_RATE = 0.0976 // 9.76%

export const MAX_UOP_BRUTTO = 260190 / 12

// Helper functions
function yearMonthToMonthIndex(yearMonth: YearMonth, baseYear: number): number {
    return (yearMonth.year - baseYear) * 12 + (yearMonth.month - 1)
}

function monthIndexToYearMonth(monthIndex: number, baseYear: number): YearMonth {
    const year = baseYear + Math.floor(monthIndex / 12)
    const month = (monthIndex % 12) + 1
    return { year, month }
}

function isMonthInPeriod(yearMonth: YearMonth, period: EmploymentPeriod): boolean {
    // Use consistent indexing: year * 12 + (month - 1) for 0-based month indexing
    const targetIndex = yearMonth.year * 12 + (yearMonth.month - 1)
    const periodStartIndex = period.from.year * 12 + (period.from.month - 1)
    const periodEndIndex = period.to.year * 12 + (period.to.month - 1)
    return targetIndex >= periodStartIndex && targetIndex <= periodEndIndex
}

function calculateContributionMonths(periods: EmploymentPeriod[], baseYear: number): number {
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
 * Calculates ZUS retirement based on employment periods
 */
function simulateZusAccumulation(config: ZusRetirementConfig): number {
    let accountBalance = 0

    // Simulate month by month from start year to retirement
    const retirementMonthIndex = yearMonthToMonthIndex(
        { year: config.retirementYear, month: config.retirementMonth },
        config.simStartYear
    )

    for (let monthIndex = 0; monthIndex < retirementMonthIndex; monthIndex++) {
        const currentYearMonth = monthIndexToYearMonth(monthIndex, config.simStartYear)

        // Apply yearly valorization at the end of each completed year
        if (monthIndex > 0 && monthIndex % 12 === 0) {
            const year = config.simStartYear + Math.floor(monthIndex / 12)
            accountBalance *= config.yearlyValorizationCoef(year)
        }

        // Add monthly contribution
        for (const period of config.employmentPeriods) {
            if (isMonthInPeriod(currentYearMonth, period)) {
                if (period.type === PeriodType.UOP) {
                    const grossSalary = Math.min(
                        period.grossMonthlySalary(currentYearMonth.year, currentYearMonth.month),
                        MAX_UOP_BRUTTO,
                    )
                    accountBalance += grossSalary * ZUS_UOP_CONTRIBUTION_RATE
                } else {
                    accountBalance += period.monthlyZusContribution(currentYearMonth.year, currentYearMonth.month)
                }
                break // Only one contribution per month
            }
        }
    }

    return accountBalance
}

export function calculateZusRetirement(config: ZusRetirementConfig): ZusRetirementResult {
    const employmentMonths = calculateContributionMonths(config.employmentPeriods, config.simStartYear)
    const cappedStudyingMonths = Math.min(config.monthsOfStudying, 8 * 12) // Cap at 8 years
    const totalMonthsContributed = employmentMonths + cappedStudyingMonths + config.monthsMaternityLeave

    // Step 1: Calculate account balance (only from employment, not studying)
    const totalZusAccountBalanceAtTimeOfRetirement = simulateZusAccumulation(config)

    // Step 2: Calculate eligibility for minimal retirement
    const requiredMonthsForMinimalRetirement = config.gender === GENDERS.MALE ? 25 * 12 : 20 * 12 // 25 years for men, 20 years for women
    const isEligibleForMinimalRetirement = totalMonthsContributed >= requiredMonthsForMinimalRetirement

    // Step 3: Calculate base monthly retirement
    const baseMonthlyRetirement = totalZusAccountBalanceAtTimeOfRetirement / config.avgMonthsAliveAfterRetirement

    // Step 4: Create function that returns retirement amount for any month
    const monthlyRetirementAmount = (monthsAfterRetirementStart: number): number => {
        let currentRetirement = baseMonthlyRetirement

        // Simulate retirement valorization month by month
        for (let month = 0; month < monthsAfterRetirementStart; month++) {
            // Valorization happens in March (month index 3 in 0-based indexing)
            if (month % 12 === 3) {
                const yearFromStart = Math.floor(month / 12)
                currentRetirement *= config.yearlyRetirementValorizationMul(yearFromStart)
            }
        }

        // Apply minimal pension guarantee
        if (currentRetirement < MINIMAL_PENSION && isEligibleForMinimalRetirement) {
            return MINIMAL_PENSION
        }

        return currentRetirement
    }

    return {
        totalMonthsContributed,
        totalZusAccountBalanceAtTimeOfRetirement,
        retirementYear: config.retirementYear,
        isEligibleForMinimalRetirement,
        monthlyRetirementAmount
    }
}
