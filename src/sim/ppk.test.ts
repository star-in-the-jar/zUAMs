import { describe, it, expect } from 'vitest'
import { calculatePpk, PPK_WELCOME_BONUS, PPK_ANNUAL_SUBSIDY, PPK_DEFAULT_EMPLOYEE_RATE, PPK_DEFAULT_EMPLOYER_RATE } from './ppk'
import { GENDERS } from '@/const/genders'
import type { PpkConfig } from './ppk'

describe('PPK Calculator', () => {
    const basicConfig: PpkConfig = {
        ppkPeriods: [
            {
                from: { year: 2020, month: 1 },
                to: { year: 2020, month: 12 },
                grossMonthlySalary: () => 5000, // 5000 PLN per month
                employeeContributionRate: PPK_DEFAULT_EMPLOYEE_RATE, // 2%
                employerContributionRate: PPK_DEFAULT_EMPLOYER_RATE  // 1.5%
            }
        ],
        gender: GENDERS.MALE,
        simStartYear: 2020,
        retirementYear: 2021,
        retirementMonth: 1,
        yearlyReturnCoef: () => 1.05, // 5% yearly return
        ageWhenJoined: 30
    }

    it('should calculate basic PPK contributions correctly', () => {
        const result = calculatePpk(basicConfig)
        
        // Expected calculations for 12 months of 5000 PLN salary:
        // Employee: 12 * 5000 * 0.02 = 1200 PLN
        // Employer: 12 * 5000 * 0.015 = 900 PLN
        // Welcome bonus: 250 PLN (age < 35)
        // Annual subsidy: 240 PLN (contributed 2% throughout the year)
        
        expect(result.totalMonthsParticipated).toBe(12)
        expect(result.totalEmployeeContributions).toBe(1200)
        expect(result.totalEmployerContributions).toBe(900)
        expect(result.totalStateBonuses).toBe(PPK_WELCOME_BONUS + PPK_ANNUAL_SUBSIDY)
        expect(result.retirementYear).toBe(2021)
        
        // Total should include contributions, bonuses and 5% return
        const expectedBase = 1200 + 900 + PPK_WELCOME_BONUS + PPK_ANNUAL_SUBSIDY
        const expectedWithReturns = expectedBase * 1.05
        expect(result.totalAccountBalanceAtRetirement).toBeCloseTo(expectedWithReturns, 2)
    })

    it('should not give welcome bonus for older participants', () => {
        const configOlderParticipant: PpkConfig = {
            ...basicConfig,
            ageWhenJoined: 40
        }
        
        const result = calculatePpk(configOlderParticipant)
        
        expect(result.totalStateBonuses).toBe(PPK_ANNUAL_SUBSIDY) // Only annual subsidy, no welcome bonus
    })

    it('should handle custom contribution rates', () => {
        const configCustomRates: PpkConfig = {
            ...basicConfig,
            ppkPeriods: [
                {
                    from: { year: 2020, month: 1 },
                    to: { year: 2020, month: 12 },
                    grossMonthlySalary: () => 5000,
                    employeeContributionRate: 0.04, // 4%
                    employerContributionRate: 0.025  // 2.5%
                }
            ]
        }
        
        const result = calculatePpk(configCustomRates)
        
        // Expected: 12 * 5000 * 0.04 = 2400 PLN (employee)
        // Expected: 12 * 5000 * 0.025 = 1500 PLN (employer)
        expect(result.totalEmployeeContributions).toBe(2400)
        expect(result.totalEmployerContributions).toBe(1500)
    })

    it('should handle multiple periods correctly', () => {
        const configMultiplePeriods: PpkConfig = {
            ...basicConfig,
            ppkPeriods: [
                {
                    from: { year: 2020, month: 1 },
                    to: { year: 2020, month: 6 },
                    grossMonthlySalary: () => 4000,
                    employeeContributionRate: PPK_DEFAULT_EMPLOYEE_RATE,
                    employerContributionRate: PPK_DEFAULT_EMPLOYER_RATE
                },
                {
                    from: { year: 2020, month: 7 },
                    to: { year: 2020, month: 12 },
                    grossMonthlySalary: () => 6000,
                    employeeContributionRate: PPK_DEFAULT_EMPLOYEE_RATE,
                    employerContributionRate: PPK_DEFAULT_EMPLOYER_RATE
                }
            ]
        }
        
        const result = calculatePpk(configMultiplePeriods)
        
        // First 6 months: 6 * 4000 * 0.02 = 480 PLN (employee)
        // Last 6 months: 6 * 6000 * 0.02 = 720 PLN (employee)
        // Total employee: 480 + 720 = 1200 PLN
        expect(result.totalEmployeeContributions).toBe(1200)
        expect(result.totalMonthsParticipated).toBe(12)
    })

    it('should handle overlapping periods correctly', () => {
        const configOverlapping: PpkConfig = {
            ...basicConfig,
            ppkPeriods: [
                {
                    from: { year: 2020, month: 1 },
                    to: { year: 2020, month: 8 },
                    grossMonthlySalary: () => 5000,
                    employeeContributionRate: PPK_DEFAULT_EMPLOYEE_RATE,
                    employerContributionRate: PPK_DEFAULT_EMPLOYER_RATE
                },
                {
                    from: { year: 2020, month: 6 }, // Overlaps with previous
                    to: { year: 2020, month: 12 },
                    grossMonthlySalary: () => 5000,
                    employeeContributionRate: PPK_DEFAULT_EMPLOYEE_RATE,
                    employerContributionRate: PPK_DEFAULT_EMPLOYER_RATE
                }
            ]
        }
        
        const result = calculatePpk(configOverlapping)
        
        // Should count 12 months total (merged overlapping periods)
        expect(result.totalMonthsParticipated).toBe(12)
    })

    it('should handle zero contributions', () => {
        const configNoContributions: PpkConfig = {
            ...basicConfig,
            ppkPeriods: []
        }
        
        const result = calculatePpk(configNoContributions)
        
        expect(result.totalMonthsParticipated).toBe(0)
        expect(result.totalEmployeeContributions).toBe(0)
        expect(result.totalEmployerContributions).toBe(0)
        expect(result.totalStateBonuses).toBe(PPK_WELCOME_BONUS) // Still gets welcome bonus if eligible
    })

    it('should calculate multi-year scenario correctly', () => {
        const configMultiYear: PpkConfig = {
            ...basicConfig,
            ppkPeriods: [
                {
                    from: { year: 2020, month: 1 },
                    to: { year: 2021, month: 12 },
                    grossMonthlySalary: () => 5000,
                    employeeContributionRate: PPK_DEFAULT_EMPLOYEE_RATE,
                    employerContributionRate: PPK_DEFAULT_EMPLOYER_RATE
                }
            ],
            retirementYear: 2022,
            retirementMonth: 1
        }
        
        const result = calculatePpk(configMultiYear)
        
        expect(result.totalMonthsParticipated).toBe(24) // 2 full years
        expect(result.totalEmployeeContributions).toBe(2400) // 24 * 5000 * 0.02
        expect(result.totalEmployerContributions).toBe(1800) // 24 * 5000 * 0.015
        
        // Should get welcome bonus + 2 annual subsidies (2020 and 2021)
        expect(result.totalStateBonuses).toBe(PPK_WELCOME_BONUS + 2 * PPK_ANNUAL_SUBSIDY)
    })
})
