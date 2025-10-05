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

export const calculatePension = (appState: AppState): string => {
  const {
    age,
    retirementAge,
    gender,
    employmentType,
    monthlyGrossSalary,
    workSinceAge,
    maternityLeaves,
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

  const zusConfig: ZusRetirementConfig = {
    avgMonthsAliveAfterRetirement: calculateAvgMonthsAfterRetirement(
      retirementAge,
      normalizedGender
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
    yearlyValorizationCoef: () => 1.025,
    yearlyRetirementValorizationMul: () => 1.025,
  };

  const zusRetirementResult = calculateZusRetirement(zusConfig);

  let value = zusRetirementResult?.monthlyRetirementAmount(0) ?? 0;

  if (
    value < MINIMAL_PENSION &&
    zusRetirementResult.isEligibleForMinimalRetirement
  ) {
    value = MINIMAL_PENSION;
  }

  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(value);
};

const prepareZusConfig = () => {};
