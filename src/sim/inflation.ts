export class InflationUtil {
    private constructor() {

    }

    /**
     * Calculates the future value of money accounting for inflation
     * @param valueNow Current value in today's currency
     * @param yearsToInflate Number of years to project forward
     * @param yearlyInflationRate Annual inflation rate (e.g., 0.03 for 3%)
     * @returns Future value adjusted for inflation
     */
    public static nowToFuture = (
        valueNow: number,
        yearsToInflate: number,
        yearlyInflationRate: number
    ): number => {
        return valueNow * Math.pow(1 + yearlyInflationRate, yearsToInflate);
    }

    /**
     * Calculates the present value of a future amount accounting for inflation (inverse of nowToFutureInflated)
     * @param futureValue Future value in inflated currency
     * @param yearsFromNow Number of years the future value is from now
     * @param yearlyInflationRate Annual inflation rate (e.g., 0.03 for 3%)
     * @returns Present value in today's purchasing power
     */
    public static futureToNow = (
        futureValue: number,
        yearsFromNow: number,
        yearlyInflationRate: number
    ): number => {
        return futureValue / Math.pow(1 + yearlyInflationRate, yearsFromNow);
    }

    /**
     * Calculates the future value using variable yearly inflation rates
     * @param valueNow Current value in today's currency
     * @param yearlyInflationRates Array of inflation rates for each year (e.g., [0.02, 0.03, 0.025])
     * @returns Future value adjusted for variable inflation
     */
    public static nowToFutureVariable = (
        valueNow: number,
        yearlyInflationRates: number[]
    ): number => {
        let value = valueNow;
        for (let i = 0; i < yearlyInflationRates.length; i++) {
            value *= (1 + yearlyInflationRates[i]);
        }
        return value;
    }

    /**
     * Calculates the present value using variable yearly inflation rates (inverse of nowToFutureInflatedVariable)
     * @param futureValue Future value in inflated currency
     * @param yearlyInflationRates Array of inflation rates for each year (e.g., [0.02, 0.03, 0.025])
     * @returns Present value in today's purchasing power
     */
    public static futureToNowVariable = (
        futureValue: number,
        yearlyInflationRates: number[]
    ): number => {
        let value = futureValue;
        for (let i = yearlyInflationRates.length - 1; i >= 0; i--) {
            value /= (1 + yearlyInflationRates[i]);
        }
        return value;
    }
}