export class PpkAccumulationUtil {
    private constructor() { }

    public static readonly computePPKMonthlyContribution = (grossSalary: number) => {
        const EMPLOYEE_CONTRIBUTION_RATE = 0.02
        const EMPLOYER_CONTRIBUTION_RATE = 0.015

        const employeeContribution = grossSalary * EMPLOYEE_CONTRIBUTION_RATE
        const employerContribution = grossSalary * EMPLOYER_CONTRIBUTION_RATE

        return employeeContribution + employerContribution
    }

    public static readonly PPK_STATE_BASE_CONTRIBUTION = 250
    public static readonly PPK_STATE_YEARLY_CONTRIBUTION = 240
}

export type PpkAccumulationSimConfig = {
    basePpkValue: number // defaults to 0
    addBaseContribution?: boolean // defaults to false; Adds PPK_STATE_BASE_CONTRIBUTION to basePpkValue

    simStartYear: number

    /**
     * How much is added to PPK each month
     * 
     * @param month 1-indexed month of that year between (incl.) 1-12
     */
    monthlyContributionAmount: (year: number, month: number) => number

    yearlyGrowCoef: (year: number) => number
}

export class PpkAccumulationSim {
    /**
     * Total accumulated PPK account balance during simulation.
     */
    private _ppkAccountValue: number = 0

    private readonly simStartYear: number
    private _simDuration: number = 0

    /**
     * How much money is added to PPK account each month.
     * @param month 1-indexed month of that year between (incl.) 1-12
     */
    private monthlyContributionAmount: (year: number, month: number) => number

    /**
     * Amount of growth occurring at given year. (>=1)
     * 
     * Note that at the beginning of the simulation, there's no growth.
     */
    private yearlyGrowCoef: (year: number) => number

    constructor({
        basePpkValue,
        addBaseContribution = false,
        simStartYear,
        monthlyContributionAmount,
        yearlyGrowCoef,
    }: PpkAccumulationSimConfig) {
        this._ppkAccountValue = basePpkValue
        if (addBaseContribution) {
            this._ppkAccountValue += PpkAccumulationUtil.PPK_STATE_BASE_CONTRIBUTION
        }
        this.simStartYear = simStartYear
        this.monthlyContributionAmount = monthlyContributionAmount
        this.yearlyGrowCoef = yearlyGrowCoef
    }

    get ppkAccountBalance() {
        return this._ppkAccountValue
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

            // Apply yearly growth at the end of each year
            if (this._simDuration > 0 && this._simDuration % 12 === 0) {
                this._ppkAccountValue = this._ppkAccountValue * this.yearlyGrowCoef(year)
                this._ppkAccountValue += PpkAccumulationUtil.PPK_STATE_YEARLY_CONTRIBUTION
            }

            // Add monthly contribution (month + 1 for one indexing)
            this._ppkAccountValue += this.monthlyContributionAmount(year, month + 1)
        }
    }
}