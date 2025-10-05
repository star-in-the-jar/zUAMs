import { GENDERS } from "@/const/genders";
import type { EmploymentPeriod, ZusRetirementConfig } from "@/sim";
import type { AppState } from "@/store/appState";
import {
  calculateAvgMonthsAfterRetirement,
  calculateStartSimYear,
  calculateRetirementYear,
  convertVibeCodedEmploymentTypeToPrzemekType,
  maternityLeavesToMaternityLeavesMonth,
} from "@/utils/configUtils";
import { calculateZusRetirement } from "@/sim";
import { MINIMAL_PENSION } from "@/const/pension";
import { solve, type SolverConfig } from "@/sim/solver";
import {
  MIN_RETIREMENT_AGE_TO_COMPUTE_SALARY,
  MAX_RETIREMENT_AGE_TO_COMPUTE_SALARY,
} from "@/const/age";

export const calculatePension = (appState: AppState) => {
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

  return Math.round(value);
};

const prepareZusConfig = (
  appState: AppState
): ZusRetirementConfig => {
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
    avgMonthsAliveAfterRetirement:
      calculateAvgMonthsAfterRetirement(retirementAge),

    employmentPeriods,
    gender: normalizedGender,
    simStartYear: workSinceYear,
    retirementYear: calculateRetirementYear(
      age,
      normalizedGender,
      retirementAge
    ),
    retirementMonth: 12,
    monthsOfStudying: 0,
    yearlyValorizationCoef: () => 1.01,
    yearlyRetirementValorizationMul: () => 1.008,
    yearlyAdditionalSavingsValorizationMul: () => 1.02,
    additionalSavings: additionalSavings,
    collectedZusBenefits: collectedZusBenefits,
    averageSickDays: averageSickDays,
    monthsMaternityLeave:
      maternityLeavesToMaternityLeavesMonth(maternityLeaves),
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
    xMin: 1,
    xMax: 20000,
  };
  const result = solve(config);
  console.log(result);
  if (Math.abs(result.fx) < 10 && result.x > 0.1 && result.x < 20000) {
    return result.x;
  }
  return undefined;
}

export function bruteForceRequiredSalaryForTargetPension(
  appState: AppState
): number | undefined {
  if (appState.employmentType !== "UoP") return undefined;
  const normalizedGender = appState.gender ?? GENDERS.MALE;
  const isInScopeToComputeSalary =
    appState.retirementAge >=
      MIN_RETIREMENT_AGE_TO_COMPUTE_SALARY[normalizedGender] &&
    appState.retirementAge <= MAX_RETIREMENT_AGE_TO_COMPUTE_SALARY;

  if (!isInScopeToComputeSalary) return undefined;

  const result = calculateRequiredSalaryForTargetPension(appState);
  if (!result) {
    appState.retirementAge += 1;
    return bruteForceRequiredSalaryForTargetPension(appState);
  }

  return result;
}

export function simPensionByStartingAfterYears(
  appState: AppState,
) {
  const zusConfig = prepareZusConfig(appState);
  const result = calculateZusRetirement(zusConfig).monthlyRetirementAmount(0);
  return Math.round(result);
}
