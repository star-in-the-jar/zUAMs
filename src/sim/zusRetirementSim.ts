export type ZusRetiementConfig = {
    baseMonthlyRetirement: number
    yearValorizationMul: (yearFromStart: number) => number
}

export class ZusRetirementSim {
    public readonly baseMonthlyRetirement: number
    private yearValorizationMul: (yearFromStart: number) => number
    
    private currentMonthlyRetirement: number
    private _simDuration: number = 0

    constructor({
        baseMonthlyRetirement,
        yearValorizationMul,
    }: ZusRetiementConfig) {
        this.baseMonthlyRetirement = baseMonthlyRetirement
        this.yearValorizationMul = yearValorizationMul
        this.currentMonthlyRetirement = baseMonthlyRetirement
    }

    /**
     * In months
     */
    get simDuration() {
        return this._simDuration
    }

    get retirementAmount() {
        return this.currentMonthlyRetirement
    }

    /**
     * Advances simulation by given amount of months.
     */
    forward = (advanceMonths: number) => {
        for (let i = 0; i < advanceMonths; i++) {
            if (this._simDuration % 12 === 3) {
                const yearFromStart = Math.floor(this._simDuration / 12)
                this.currentMonthlyRetirement = this.currentMonthlyRetirement * this.yearValorizationMul(yearFromStart)
            }
            
            this._simDuration += 1
        }
    }
}