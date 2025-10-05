export class IncomeTaxUtil {
    public static readonly TAX_FREE_AMOUNT = 20000 / 12
    public static readonly INCOME_TAX_FIRST_RATE = 0.12
    public static readonly HEALTH_TAX_RATE = 0.09

    public static readonly taxedZusRetirementMonthly = (
        retirementAmount: number
    ) => {
        retirementAmount = retirementAmount * (1 - IncomeTaxUtil.HEALTH_TAX_RATE)
        const taxBase = retirementAmount - IncomeTaxUtil.TAX_FREE_AMOUNT
        if (taxBase < 0) {
            return retirementAmount
        } else {
            return IncomeTaxUtil.TAX_FREE_AMOUNT + taxBase * (1 - IncomeTaxUtil.INCOME_TAX_FIRST_RATE)
        }
    }
}