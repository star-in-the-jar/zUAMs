import { calculateZusRetirement, PeriodType, type ZusRetirementConfig, type EmploymentPeriod } from '@/sim/zus';
import { GENDERS, type Gender } from '@/const/genders';
import { IncomeTaxUtil } from '@/sim/incomeTax';

/**
 * Simplified input for retirement calculation tool
 */
export interface RetirementCalculationInput {
  /** Current age of the person */
  currentAge: number;
  /** Gender: 'male' or 'female' */
  gender: 'male' | 'female';
  /** Current monthly gross salary (for UoP employment) */
  currentMonthlySalary: number;
  /** Years of work experience already completed */
  yearsWorked: number;
  /** Years of study (counted towards retirement, max 8 years) */
  yearsStudied?: number;
  /** Months of maternity leave (counted towards retirement period but no ZUS contributions) */
  monthsMaternityLeave?: number;
  /** Planned retirement age (optional, defaults to legal retirement age) */
  plannedRetirementAge?: number;
  /** Expected monthly salary growth rate (optional, default 3% annually) */
  salaryGrowthRate?: number;
}

/**
 * Simplified output for retirement calculation
 * All monetary values are presented in real terms (today's purchasing power)
 * accounting for expected inflation over time
 */
export interface RetirementCalculationResult {
  /** Monthly retirement amount (GROSS, before taxes) - in today's purchasing power */
  monthlyRetirementAmountGross: number;
  /** Monthly retirement amount (NET, after taxes and health insurance) - in today's purchasing power */
  monthlyRetirementAmountNet: number;
  /** Total months that will be contributed */
  totalMonthsContributed: number;
  /** Months of maternity leave (counted in retirement period but no contributions) */
  monthsMaternityLeave: number;
  /** Total ZUS account balance at retirement - in today's purchasing power */
  totalAccountBalance: number;
  /** Retirement year */
  retirementYear: number;
  /** Whether eligible for minimal retirement */
  isEligible: boolean;
  /** Legal retirement age for this gender */
  legalRetirementAge: number;
  /** Annual gross retirement amount - in today's purchasing power */
  annualRetirementAmountGross: number;
  /** Annual net retirement amount - in today's purchasing power */
  annualRetirementAmountNet: number;
  /** Warning/info messages */
  warnings: string[];
}

/**
 * Available AI tools for the assistant
 */
export const AI_TOOLS = {
  calculateRetirement: 'calculateRetirement'
} as const;

/**
 * Tool function: Calculate retirement amount based on simplified inputs
 */
export function calculateRetirementTool(input: RetirementCalculationInput): RetirementCalculationResult {
  const warnings: string[] = [];
  
  // Validate and set defaults
  const gender: Gender = input.gender === 'male' ? GENDERS.MALE : GENDERS.FEMALE;
  const legalRetirementAge = gender === GENDERS.MALE ? 65 : 60;
  const plannedRetirementAge = input.plannedRetirementAge || legalRetirementAge;
  const salaryGrowthRate = input.salaryGrowthRate || 0.03; // 3% default
  const yearsStudied = Math.min(input.yearsStudied || 0, 8); // Cap at 8 years
  const monthsMaternityLeave = input.monthsMaternityLeave || 0;
  
  // Add warnings
  if (plannedRetirementAge < legalRetirementAge) {
    warnings.push(`Planowany wiek emerytalny (${plannedRetirementAge}) jest niższy od ustawowego (${legalRetirementAge})`);
  }
  
  if ((input.yearsStudied || 0) > 8) {
    warnings.push(`Lata studiów zostały ograniczone do 8 lat (maksimum uwzględniane przez ZUS)`);
  }
  
  // Calculate simulation period
  const currentYear = new Date().getFullYear();
  const retirementYear = currentYear + (plannedRetirementAge - input.currentAge);
  
  // Create employment period (current job until retirement)
  const currentJobPeriod: EmploymentPeriod = {
    type: PeriodType.UOP,
    from: { year: currentYear - input.yearsWorked, month: 1 },
    to: { year: retirementYear, month: 1 },
    grossMonthlySalary: (year: number) => {
      const yearsFromNow = year - currentYear;
      return input.currentMonthlySalary * Math.pow(1 + salaryGrowthRate, yearsFromNow);
    }
  };
  
  // ZUS configuration
  const zusConfig: ZusRetirementConfig = {
    employmentPeriods: [currentJobPeriod],
    gender,
    simStartYear: currentYear - input.yearsWorked,
    retirementYear,
    retirementMonth: 1,
    avgMonthsAliveAfterRetirement: gender === GENDERS.MALE ? 16 * 12 : 22 * 12, // Avg life expectancy after retirement
    monthsOfStudying: yearsStudied * 12,
    monthsMaternityLeave: monthsMaternityLeave,
    yearlyValorizationCoef: () => 1.025, // Fixed 2.5% valorization
    yearlyRetirementValorizationMul: () => 1.025 // Fixed 2.5% retirement valorization
  };
  
  // Calculate retirement
  const result = calculateZusRetirement(zusConfig);
  
  // Calculate gross amounts
  const monthlyGross = result.monthlyRetirementAmount(0);
  const annualGross = monthlyGross * 12;
  
  // Calculate net amounts using income tax utility
  const monthlyNet = IncomeTaxUtil.taxedZusRetirement(monthlyGross);
  const annualNet = monthlyNet * 12;
  
  return {
    monthlyRetirementAmountGross: monthlyGross,
    monthlyRetirementAmountNet: monthlyNet,
    annualRetirementAmountGross: annualGross,
    annualRetirementAmountNet: annualNet,
    totalMonthsContributed: result.totalMonthsContributed,
    monthsMaternityLeave: monthsMaternityLeave,
    totalAccountBalance: result.totalZusAccountBalanceAtTimeOfRetirement,
    retirementYear: result.retirementYear,
    isEligible: result.isEligibleForMinimalRetirement,
    legalRetirementAge,
    warnings
  };
}

/**
 * Tool dispatcher - calls appropriate tool based on tool name
 */
export function callAITool(toolName: string, input: any): any {
  switch (toolName) {
    case AI_TOOLS.calculateRetirement:
      return calculateRetirementTool(input as RetirementCalculationInput);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Get tool description for AI prompt
 */
export function getToolDescriptions(): string {
  return `
Masz dostęp do następujących narzędzi do obliczeń emerytalnych:

**calculateRetirement** - Oblicza prognozę emerytury z uwzględnieniem inflacji i podatków

INSTRUKCJE UŻYCIA:
- ZAWSZE używaj tego narzędzia gdy użytkownik pyta o emeryturę, nawet jeśli nie podał wszystkich danych
- Zakładaj rozsądne wartości domyślne dla brakujących informacji:
  * currentAge: 30 (jeśli nie podano)
  * gender: spytaj się lub wywnioskuj z kontekstu, jeśli niemożliwe użyj "female"
  * currentMonthlySalary: NIGDY NIE ZAKŁADAJ TEGO PARAMETRU, ZAWSZE PYTAJ
  * yearsWorked: currentAge - 22 (zakładając start pracy po studiach)
  * yearsStudied: 5 (typowe studia magisterskie)
  * monthsMaternityLeave: 0 (domyślnie, chyba że wspomni o dzieciach/urlopie)
  * plannedRetirementAge: 65 dla mężczyzn, 60 dla kobiet (wiek ustawowy)
  * salaryGrowthRate: 0.00

KIEDY PRZELICZAĆ:
- Gdy użytkownik zmieni jakiekolwiek parametry ("a gdybym zarabiał 7000?", "a gdybym przeszedł na emeryturę wcześniej?")
- Gdy chce porównać różne scenariusze
- Gdy pyta "co by było gdyby..."

Parametry JSON (wszystkie opcjonalne poza wymaganymi):
{
  "currentAge": number,           // WYMAGANE: aktualny wiek
  "gender": "male" | "female",    // WYMAGANE: płeć  
  "currentMonthlySalary": number, // aktualne wynagrodzenie brutto miesięczne (domyślnie 5000)
  "yearsWorked": number,          // lata pracy już przepracowane (domyślnie currentAge-22)
  "yearsStudied": number,         // lata studiów (domyślnie 5, max 8)
  "monthsMaternityLeave": number, // miesiące urlopu macierzyńskiego (domyślnie 0)
  "plannedRetirementAge": number, // planowany wiek emerytalny (domyślnie ustawowy)
  "salaryGrowthRate": number      // roczny wzrost wynagrodzenia (domyślnie 0)
}

PRZYKŁADY UŻYCIA:
- "Ile będę mieć emerytury?" → użyj domyślnych wartości, spytaj o wiek i płeć
- "Mam 35 lat i zarabiam 8000" → {currentAge: 35, currentMonthlySalary: 8000, reszta domyślnie}
- "A gdybym przeszedł na emeryturę w 62?" → przelicz z plannedRetirementAge: 62

Rezultat zawiera szczegółową prognozę emerytury w wartościach realnych (dzisiejsza siła nabywcza).
`;
}