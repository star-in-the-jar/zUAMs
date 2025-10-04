import { describe, it, expect } from 'vitest'
import { 
    calculateZusRetirement,
    ZUS_UOP_CONTRIBUTION_RATE,
    PeriodType
} from './zus'
import type { 
    ZusRetirementConfig,
    EmploymentPeriod
} from './zus'

describe('ZUS Retirement Calculator', () => {
    it('should calculate retirement for simple UoP period', () => {
        const uopPeriod: EmploymentPeriod = {
            type: PeriodType.UOP,
            from: { year: 2020, month: 1 },
            to: { year: 2020, month: 12 },
            grossMonthlySalary: () => 5000 // Fixed salary
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [uopPeriod],
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 240,
            monthsOfStudying: 0,
            yearlyValorizationCoef: () => 1.0, // No valorization for simple test
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        // Expected: 12 months of contributions
        expect(result.totalMonthsContributed).toBe(12)

        // Expected account balance: 12 months * 5000 * 0.0976 = 5856
        const expectedBalance = 12 * 5000 * ZUS_UOP_CONTRIBUTION_RATE
        expect(result.totalZusAccountBalanceAtTimeOfRetirement).toBeCloseTo(expectedBalance, 2)

        // Expected monthly retirement: 5856 / 240 = 24.4
        const expectedMonthlyRetirement = expectedBalance / 240
        expect(result.monthlyRetirementAmount(0)).toBeCloseTo(expectedMonthlyRetirement, 2)

        expect(result.retirementYear).toBe(2021)
    })

    it('should handle self-employed period', () => {
        const selfEmployedPeriod: EmploymentPeriod = {
            type: PeriodType.SELF_EMPLOYED,
            from: { year: 2020, month: 1 },
            to: { year: 2020, month: 6 },
            monthlyZusContribution: () => 800 // Fixed contribution
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [selfEmployedPeriod],
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 120,
            monthsOfStudying: 0,
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        expect(result.totalMonthsContributed).toBe(6)
        expect(result.totalZusAccountBalanceAtTimeOfRetirement).toBe(6 * 800)
        expect(result.monthlyRetirementAmount(0)).toBe((6 * 800) / 120)
    })

    it('should merge overlapping periods', () => {
        const period1: EmploymentPeriod = {
            type: PeriodType.UOP,
            from: { year: 2020, month: 1 },
            to: { year: 2020, month: 6 },
            grossMonthlySalary: () => 4000
        }

        const period2: EmploymentPeriod = {
            type: PeriodType.SELF_EMPLOYED,
            from: { year: 2020, month: 4 }, // Overlaps with period1
            to: { year: 2020, month: 9 },
            monthlyZusContribution: () => 600
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [period1, period2],
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 240,
            monthsOfStudying: 0,
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        // Should count 9 months total (Jan-Sep), not 15
        expect(result.totalMonthsContributed).toBe(9)
    })

    it('should apply retirement valorization in March', () => {
        const period: EmploymentPeriod = {
            type: PeriodType.UOP,
            from: { year: 2020, month: 1 },
            to: { year: 2020, month: 1 },
            grossMonthlySalary: () => 1000
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [period],
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 100,
            monthsOfStudying: 0,
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.05 // 5% increase
        }

        const result = calculateZusRetirement(config)
        
        const baseRetirement = result.monthlyRetirementAmount(0)
        const retirementAfter15Months = result.monthlyRetirementAmount(15) // After March valorization
        
        // After 15 months (which includes March of year 1), should be valorized
        expect(retirementAfter15Months).toBeCloseTo(baseRetirement * 1.05, 5)
    })

    it('should add studying months to total months contributed without affecting account balance', () => {
        const period: EmploymentPeriod = {
            type: PeriodType.UOP,
            from: { year: 2020, month: 1 },
            to: { year: 2020, month: 6 },
            grossMonthlySalary: () => 5000
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [period],
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 240,
            monthsOfStudying: 24, // 2 years of studying
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        // Should count 6 months employment + 24 months studying = 30 months
        expect(result.totalMonthsContributed).toBe(30)
        
        // Account balance should only reflect employment (6 months * 5000 * 0.0976)
        const expectedBalance = 6 * 5000 * ZUS_UOP_CONTRIBUTION_RATE
        expect(result.totalZusAccountBalanceAtTimeOfRetirement).toBeCloseTo(expectedBalance, 2)
    })

    it('should cap studying months at 8 years (96 months)', () => {
        const period: EmploymentPeriod = {
            type: PeriodType.UOP,
            from: { year: 2020, month: 1 },
            to: { year: 2020, month: 1 },
            grossMonthlySalary: () => 1000
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [period],
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 100,
            monthsOfStudying: 120, // 10 years - should be capped at 96
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        // Should be capped at 1 employment month + 96 studying months = 97 months
        expect(result.totalMonthsContributed).toBe(97)
    })
})