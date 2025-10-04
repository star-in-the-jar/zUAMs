export class ZusAccumulationUtil {
    private constructor() { }

    /**
     * Computes the base monthly retirement.
     * 
     * @param avgMonthAlive - Average number of months expected to live in retirement (delta of age and average of month that person lives)
     * @param retirementAccountBalance - Total balance available in the retirement account
     * @returns Monthly retirement amount
     */
    public static readonly computeBaseRetirement = (
        avgMonthAlive: number,
        retirementAccountBalance: number
    ) => {
        return retirementAccountBalance / avgMonthAlive
    }
}


export type ZusAccumulationSimConfig = {
    baseRetirementAccountValue: number

    simStartYear: number

    /**
     * 
     * @param year 
     * @param month 1-indexed month
     * @returns 
     */
    monthlyDelta: (year: number, month: number) => number
    yearlyValorizationCoef: (year: number) => number
}

export class ZusAccumulationSim {
    /**
     * Total accumulated retirement account balance during simulation.
     */
    private _retirementAccountValue: number = 0

    private readonly simStartYear: number
    private _simDuration: number = 0

    /**
     * How much money is added to account each month.
     * @param month 1-indexed month of that year between (incl.) 1-12
     */
    private monthlyDelta: (year: number, month: number) => number

    /**
     * Amount of valorization occurring at given year. (>=1)
     * 
     * Note that at the begining of the simulation, there's no valorization.
     */
    private yearlyValorizationCoef: (year: number) => number


    constructor({
        baseRetirementAccountValue,
        simStartYear,
        monthlyDelta,
        yearlyValorizationCoef,
    }: ZusAccumulationSimConfig) {
        this._retirementAccountValue = baseRetirementAccountValue
        this.simStartYear = simStartYear
        this.monthlyDelta = monthlyDelta
        this.yearlyValorizationCoef = yearlyValorizationCoef
    }

    get retirementAccountBalance() {
        return this._retirementAccountValue
    }

    /**
     * In months
     */
    get simDuration() {
        return this._simDuration
    }

    /**
     * Advances simulation by given amount of months.
     */
    forward = (advanceMonths: number) => {
        for (let i = 0; i < advanceMonths; i++) {
            this._simDuration += 1
            const year = this.simStartYear + Math.floor(this._simDuration / 12)
            const month = this._simDuration % 12

            // TODO: when valorization occurs
            if (this._simDuration > 0 && this._simDuration % 12 === 0) {
                this._retirementAccountValue = this._retirementAccountValue * this.yearlyValorizationCoef(year)
            }

            // month + 1 for one indexing
            this._retirementAccountValue += this.monthlyDelta(year, month + 1)
        }
    }
}
