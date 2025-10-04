// IKE (Indywidualny Konto Emerytalne - Individual Retirement Account) Types
import type { Gender } from '@/const/genders'
import type { YearMonth } from './zus'

/**
 * IKE contribution period
 */
export type IkePeriod = {
    from: YearMonth
    to: YearMonth
    /** Annual contribution amount in PLN */
    annualContribution: (year: number) => number
}

/**
 * Configuration for IKE calculation
 */
export type IkeConfig = {
    ikePeriods: IkePeriod[]
    gender: Gender
    simStartYear: number
    retirementYear: number
    retirementMonth: number
    /** Yearly investment return coefficient. Default: 5% (1.05) */
    yearlyReturnCoef: (year: number) => number
    /** Tax rate for calculating tax deduction benefits */
    taxRate: (year: number) => number
    /** Annual IKE contribution limit for a given year */
    ikeLimit: (year: number) => number
}

/**
 * Result of IKE calculation
 */
export type IkeResult = {
    totalYearsContributed: number
    totalContributions: number
    totalTaxDeductions: number
    totalAccountBalanceAtRetirement: number
    retirementYear: number
}

// Helper functions
function isYearInPeriod(year: number, period: IkePeriod): boolean {
    return year >= period.from.year && year <= period.to.year
}

function calculateContributionYears(periods: IkePeriod[], baseYear: number, retirementYear: number): Set<number> {
    const contributionYears = new Set<number>()
    
    for (const period of periods) {
        const startYear = Math.max(period.from.year, baseYear)
        const endYear = Math.min(period.to.year, retirementYear - 1)
        
        for (let year = startYear; year <= endYear; year++) {
            contributionYears.add(year)
        }
    }
    
    return contributionYears
}

/**
 * Simulates IKE account accumulation over time
 */
function simulateIkeAccumulation(config: IkeConfig): {
    accountBalance: number
    totalContributions: number
    totalTaxDeductions: number
} {
    let accountBalance = 0
    let totalContributions = 0
    let totalTaxDeductions = 0
    
    // Track contributions year by year
    const yearlyContributions: Record<number, number> = {}
    
    // Calculate contributions for each year
    for (let year = config.simStartYear; year < config.retirementYear; year++) {
        let yearContribution = 0
        
        // Find applicable period for this year
        for (const period of config.ikePeriods) {
            if (isYearInPeriod(year, period)) {
                const proposedContribution = period.annualContribution(year)
                const yearLimit = config.ikeLimit(year)
                
                // Contribution cannot exceed annual limit
                yearContribution = Math.min(proposedContribution, yearLimit)
                break
            }
        }
        
        if (yearContribution > 0) {
            yearlyContributions[year] = yearContribution
            totalContributions += yearContribution
            
            // Calculate tax deduction (contribution is deductible from taxable income)
            const taxDeduction = yearContribution * config.taxRate(year)
            totalTaxDeductions += taxDeduction
            
            // Add contribution to account balance
            accountBalance += yearContribution
        }
    }
    
    // Apply investment returns year by year (compound growth)
    let currentBalance = 0
    for (let year = config.simStartYear; year < config.retirementYear; year++) {
        // Add this year's contribution
        const yearContribution = yearlyContributions[year] ?? 0
        currentBalance += yearContribution
        
        // Apply investment return at the end of the year
        currentBalance *= config.yearlyReturnCoef(year)
    }
    
    return {
        accountBalance: currentBalance,
        totalContributions,
        totalTaxDeductions
    }
}

/**
 * Calculates IKE account balance and tax benefits
 */
export function calculateIke(config: IkeConfig): IkeResult {
    const contributionYears = calculateContributionYears(
        config.ikePeriods, 
        config.simStartYear, 
        config.retirementYear
    )
    
    const {
        accountBalance,
        totalContributions,
        totalTaxDeductions
    } = simulateIkeAccumulation(config)
    
    return {
        totalYearsContributed: contributionYears.size,
        totalContributions,
        totalTaxDeductions,
        totalAccountBalanceAtRetirement: accountBalance,
        retirementYear: config.retirementYear
    }
}

/**
 * Helper function to create a simple IKE period with constant annual contribution
 */
export function createConstantIkePeriod(
    fromYear: number,
    toYear: number,
    annualAmount: number
): IkePeriod {
    return {
        from: { year: fromYear, month: 1 },
        to: { year: toYear, month: 12 },
        annualContribution: () => annualAmount
    }
}

/**
 * Helper function to create an IKE period with maximum allowed contribution
 */
export function createMaxIkePeriod(
    fromYear: number,
    toYear: number,
    ikeLimit: (year: number) => number
): IkePeriod {
    return {
        from: { year: fromYear, month: 1 },
        to: { year: toYear, month: 12 },
        annualContribution: (year: number) => ikeLimit(year)
    }
}
