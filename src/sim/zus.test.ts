import { describe, it, expect } from 'vitest'
import { 
    calculateZusRetirement,
    ZUS_UOP_CONTRIBUTION_RATE,
    PeriodType
} from './zus'
import { GENDERS } from '@/const/genders'
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
            gender: GENDERS.MALE,
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 240,
            monthsOfStudying: 0,
            monthsMaternityLeave: 0,
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
            gender: GENDERS.FEMALE,
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 120,
            monthsOfStudying: 0,
            monthsMaternityLeave: 0,
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
            gender: GENDERS.MALE,
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 240,
            monthsOfStudying: 0,
            monthsMaternityLeave: 0,
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
            gender: GENDERS.MALE,
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 100,
            monthsOfStudying: 0,
            monthsMaternityLeave: 0,
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
            gender: GENDERS.MALE,
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 240,
            monthsOfStudying: 24, // 2 years of studying
            monthsMaternityLeave: 0,
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
            gender: GENDERS.FEMALE,
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 100,
            monthsOfStudying: 120, // 10 years - should be capped at 96
            monthsMaternityLeave: 0,
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        // Should be capped at 1 employment month + 96 studying months = 97 months
        expect(result.totalMonthsContributed).toBe(97)
    })

    it('should correctly determine minimal retirement eligibility for men (25 years)', () => {
        const period: EmploymentPeriod = {
            type: PeriodType.UOP,
            from: { year: 2020, month: 1 },
            to: { year: 2044, month: 12 }, // 25 years exactly
            grossMonthlySalary: () => 5000
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [period],
            gender: GENDERS.MALE,
            simStartYear: 2020,
            retirementYear: 2045,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 240,
            monthsOfStudying: 0,
            monthsMaternityLeave: 0,
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        expect(result.totalMonthsContributed).toBe(25 * 12) // 300 months
        expect(result.isEligibleForMinimalRetirement).toBe(true)
    })

    it('should correctly determine minimal retirement eligibility for women (20 years)', () => {
        const period: EmploymentPeriod = {
            type: PeriodType.UOP,
            from: { year: 2020, month: 1 },
            to: { year: 2039, month: 12 }, // 20 years exactly
            grossMonthlySalary: () => 5000
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [period],
            gender: GENDERS.FEMALE,
            simStartYear: 2020,
            retirementYear: 2040,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 240,
            monthsOfStudying: 0,
            monthsMaternityLeave: 0,
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        expect(result.totalMonthsContributed).toBe(20 * 12) // 240 months
        expect(result.isEligibleForMinimalRetirement).toBe(true)
    })

    it('should not be eligible for minimal retirement with insufficient months', () => {
        const period: EmploymentPeriod = {
            type: PeriodType.UOP,
            from: { year: 2020, month: 1 },
            to: { year: 2038, month: 12 }, // 19 years for woman (not enough)
            grossMonthlySalary: () => 5000
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [period],
            gender: GENDERS.FEMALE,
            simStartYear: 2020,
            retirementYear: 2039,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 240,
            monthsOfStudying: 0,
            monthsMaternityLeave: 0,
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        expect(result.totalMonthsContributed).toBe(19 * 12) // 228 months
        expect(result.isEligibleForMinimalRetirement).toBe(false)
    })

    it('should add maternity leave months to total months contributed without affecting account balance', () => {
        const period: EmploymentPeriod = {
            type: PeriodType.UOP,
            from: { year: 2020, month: 1 },
            to: { year: 2020, month: 6 },
            grossMonthlySalary: () => 5000
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [period],
            gender: GENDERS.FEMALE,
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 240,
            monthsOfStudying: 0,
            monthsMaternityLeave: 12, // 12 months maternity leave
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        // Should count 6 months employment + 12 months maternity leave = 18 months
        expect(result.totalMonthsContributed).toBe(18)
        
        // Account balance should only reflect employment (6 months * 5000 * 0.0976)
        const expectedBalance = 6 * 5000 * ZUS_UOP_CONTRIBUTION_RATE
        expect(result.totalZusAccountBalanceAtTimeOfRetirement).toBeCloseTo(expectedBalance, 2)
    })

    it('should combine studying and maternity leave months with employment months', () => {
        const period: EmploymentPeriod = {
            type: PeriodType.UOP,
            from: { year: 2020, month: 1 },
            to: { year: 2020, month: 3 },
            grossMonthlySalary: () => 4000
        }

        const config: ZusRetirementConfig = {
            employmentPeriods: [period],
            gender: GENDERS.FEMALE,
            simStartYear: 2020,
            retirementYear: 2021,
            retirementMonth: 1,
            avgMonthsAliveAfterRetirement: 200,
            monthsOfStudying: 36, // 3 years studying
            monthsMaternityLeave: 18, // 18 months maternity leave
            yearlyValorizationCoef: () => 1.0,
            yearlyRetirementValorizationMul: () => 1.0
        }

        const result = calculateZusRetirement(config)

        // Should count 3 months employment + 36 months studying + 18 months maternity = 57 months
        expect(result.totalMonthsContributed).toBe(57)
        
        // Account balance should only reflect employment (3 months * 4000 * 0.0976)
        const expectedBalance = 3 * 4000 * ZUS_UOP_CONTRIBUTION_RATE
        expect(result.totalZusAccountBalanceAtTimeOfRetirement).toBeCloseTo(expectedBalance, 2)
    })
})