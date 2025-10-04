import { describe, it, expect } from 'vitest'
import { calculateIke, createConstantIkePeriod } from './ike'
import { GENDERS } from '@/const/genders'
import type { IkeConfig } from './ike'

describe('IKE Calculator', () => {
    // Standard Polish IKE limits
    const standardIkeLimit = (year: number): number => {
        if (year < 2020) return 5992.2
        if (year === 2020) return 5992.2
        if (year === 2021 || year === 2022) return 6272.4
        if (year === 2023) return 6976.8
        if (year >= 2024) return 7669.01
        return 7669.01
    }

    const basicConfig: IkeConfig = {
        ikePeriods: [
            createConstantIkePeriod(2020, 2022, 5000) // 5000 PLN per year
        ],
        gender: GENDERS.MALE,
        simStartYear: 2020,
        retirementYear: 2023,
        retirementMonth: 1,
        yearlyReturnCoef: () => 1.05, // 5% yearly return
        taxRate: () => 0.17, // 17% tax rate
        ikeLimit: standardIkeLimit // Use standard IKE limits
    }

    it('should calculate basic IKE contributions correctly', () => {
        const result = calculateIke(basicConfig)
        
        expect(result.totalYearsContributed).toBe(3) // 2020, 2021, 2022
        expect(result.totalContributions).toBe(15000) // 3 * 5000
        expect(result.totalTaxDeductions).toBeCloseTo(2550, 2) // 15000 * 0.17
        expect(result.retirementYear).toBe(2023)
    })

    it('should respect annual IKE limits', () => {
        const highContributionConfig: IkeConfig = {
            ...basicConfig,
            ikePeriods: [
                createConstantIkePeriod(2024, 2024, 10000) // Above 2024 limit
            ],
            retirementYear: 2025,
            ikeLimit: standardIkeLimit
        }
        
        const result = calculateIke(highContributionConfig)
        
        // Should be limited to 2024 limit (7669.01 PLN)
        expect(result.totalContributions).toBe(standardIkeLimit(2024))
    })

    it('should return correct IKE limits for different years', () => {
        expect(standardIkeLimit(2024)).toBe(7669.01)
        expect(standardIkeLimit(2023)).toBe(6976.8)
        expect(standardIkeLimit(2019)).toBe(5992.2) // Should use 2020 limit for earlier years
        expect(standardIkeLimit(2030)).toBe(7669.01) // Should use latest limit for future years
    })
})