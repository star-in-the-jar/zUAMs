import { GENDERS } from "@/const/genders";
import type { EmploymentPeriod, ZusRetirementConfig } from "@/sim";
import type { AppState } from "@/store/appState";
import {
  calculateAvgMonthsAfterRetirement,
  calculateStartSimYear,
  calculateRetirementYear,
  convertVibeCodedEmploymentTypeToPrzemekType,
} from "@/utils/configUtils";
import { calculateZusRetirement } from "@/sim";
import { MINIMAL_PENSION } from "@/const/pension";
import { solve, type SolverConfig } from "@/sim/solver";


export const calculatePension = (appState: AppState): string => {
  const zusRetirementResult = calculateZusRetirement(
    prepareZusConfig(appState)
  );

  let value = zusRetirementResult?.monthlyRetirementAmount(0) ?? 0;

  if (
    value < MINIMAL_PENSION &&
    zusRetirementResult.isEligibleForMinimalRetirement
  ) {
    value = MINIMAL_PENSION;
  }

  return `${Math.round(value)} zł`;
};

const prepareZusConfig = (appState: AppState): ZusRetirementConfig => {
  const {
    age,
    retirementAge,
    gender,
    employmentType,
    monthlyGrossSalary,
    workSinceAge,
    maternityLeaves,
    additionalSavings,
    collectedZusBenefits,
    averageSickDays,
  } = appState;
  const normalizedGender = gender ?? GENDERS.MALE;

  const workSinceYear = calculateStartSimYear(age, workSinceAge);

  const employmentPeriodWithoutFn: Omit<
    EmploymentPeriod,
    "grossMonthlySalary" | "monthlyZusContribution"
  > = {
    from: {
      year: workSinceYear,
      month: 1,
    },
    to: {
      year: calculateRetirementYear(age, normalizedGender, retirementAge),
      month: 12,
    },
    type: convertVibeCodedEmploymentTypeToPrzemekType(employmentType),
  };

  const employmentPeriodWithFn: EmploymentPeriod = {
    ...employmentPeriodWithoutFn,
    grossMonthlySalary: () => monthlyGrossSalary,
    monthlyZusContribution: () => {
      return (monthlyGrossSalary * 0.1371) / 2;
    },
  };

  const employmentPeriods: EmploymentPeriod[] = [employmentPeriodWithFn];

  return {
    avgMonthsAliveAfterRetirement: calculateAvgMonthsAfterRetirement(
      retirementAge,
    ),

    employmentPeriods,
    gender: normalizedGender,
    simStartYear: workSinceYear,
    retirementYear: calculateRetirementYear(
      age,
      normalizedGender,
      retirementAge
    ),
    retirementMonth: 12,
    monthsMaternityLeave: maternityLeaves * 5,
    monthsOfStudying: 0,
    yearlyValorizationCoef: () => 1.01,
    yearlyRetirementValorizationMul: () => 1.008,
    yearlyAdditionalSavingsValorizationMul: () => 1.02,
    additionalSavings: additionalSavings,
    collectedZusBenefits: collectedZusBenefits,
    averageSickDays: averageSickDays,
  };
};

/**
 * Calculates the required gross monthly salary to achieve a target retirement (PLN/month) for UoP.
 * Returns undefined if not UoP or not solvable.
 */
export function calculateRequiredSalaryForTargetPension(
  appState: AppState
): number | undefined {
  // Only for UoP
  if (appState.employmentType !== "UoP") return undefined;

  const zusConfigBase = prepareZusConfig(appState);
  const config: SolverConfig = {
    maxIterations: 10000,
    tolerance: 1e-3,
    f: (monthlySalary) => {
      const zusConfig = {
        ...zusConfigBase,
        employmentPeriods: [
          {
            ...zusConfigBase.employmentPeriods[0],
            grossMonthlySalary: () => monthlySalary,
          },
        ],
      };
      const result = calculateZusRetirement(zusConfig);
      return result.monthlyRetirementAmount(0) - appState.pension;
    },
    xMin: 1000,
    xMax: 20000,
  };
  const result = solve(config);
  if (Math.abs(result.fx) < 10 && result.x > 1000 && result.x < 20000) {
    return result.x;
  }
  return undefined;
}
