import { RETIREMENT_AGE } from "@/const/age";
import type { Gender } from "@/const/genders";
import { PeriodType } from "@/sim";

interface GusEstimatedLifeExpectancy {
  age: number;
  months: number;
}

export const GUS_ESTIMATED_LIFE_EXPECTANCY_MONTHS: GusEstimatedLifeExpectancy[] = [
  { age: 30, months: 591.5 },
  { age: 31, months: 580.0 },
  { age: 32, months: 568.4 },
  { age: 33, months: 557.0 },
  { age: 34, months: 545.5 },
  { age: 35, months: 534.1 },
  { age: 36, months: 522.8 },
  { age: 37, months: 511.4 },
  { age: 38, months: 500.2 },
  { age: 39, months: 488.9 },
  { age: 40, months: 477.6 },
  { age: 41, months: 466.4 },
  { age: 42, months: 455.3 },
  { age: 43, months: 444.1 },
  { age: 44, months: 433.0 },
  { age: 45, months: 422.0 },
  { age: 46, months: 411.0 },
  { age: 47, months: 400.1 },
  { age: 48, months: 389.3 },
  { age: 49, months: 378.5 },
  { age: 50, months: 367.8 },
  { age: 51, months: 357.1 },
  { age: 52, months: 346.7 },
  { age: 53, months: 336.2 },
  { age: 54, months: 325.9 },
  { age: 55, months: 315.7 },
  { age: 56, months: 305.6 },
  { age: 57, months: 295.7 },
  { age: 58, months: 285.7 },
  { age: 59, months: 276.0 },
  { age: 60, months: 266.4 },
  { age: 61, months: 257.0 },
  { age: 62, months: 247.7 },
  { age: 63, months: 238.6 },
  { age: 64, months: 229.6 },
  { age: 65, months: 220.8 },
  { age: 66, months: 212.2 },
  { age: 67, months: 203.6 },
  { age: 68, months: 195.4 },
  { age: 69, months: 187.1 },
  { age: 70, months: 179.0 },
  { age: 71, months: 171.0 },
  { age: 72, months: 163.2 },
  { age: 73, months: 155.5 },
  { age: 74, months: 148.0 },
  { age: 75, months: 140.5 },
  { age: 76, months: 133.2 },
  { age: 77, months: 126.1 },
  { age: 78, months: 119.2 },
  { age: 79, months: 112.3 },
  { age: 80, months: 105.7 },
  { age: 81, months: 99.2 },
  { age: 82, months: 93.0 },
  { age: 83, months: 87.0 },
  { age: 84, months: 81.2 },
  { age: 85, months: 75.8 },
  { age: 86, months: 70.8 },
  { age: 87, months: 66.1 },
  { age: 88, months: 61.7 },
  { age: 89, months: 57.6 },
  { age: 90, months: 53.8 },
];
export const calculateStartSimYear = (age: number, workSinceAge: number) => {
  const currentYear = new Date().getFullYear();
  const yearsWorked = age - workSinceAge;
  return currentYear - yearsWorked;
};

export const calculateRetirementYear = (
  age: number,
  gender: Gender,
  desiredRetirementAge: number | undefined = undefined
): number => {
  let retirementAge = desiredRetirementAge;
  if (!retirementAge) {
    retirementAge = RETIREMENT_AGE[gender];
  }
  const yearsLeft = retirementAge - age;
  return new Date().getFullYear() + yearsLeft;
};

export const calculateAvgMonthsAfterRetirement = (
  desiredRetirementAge: number,
): number => {
  const lifeExpectancyMonths = GUS_ESTIMATED_LIFE_EXPECTANCY_MONTHS.find((row: { age: number, months: number }) => row.age === desiredRetirementAge)?.months;
  return lifeExpectancyMonths ?? 0;
};

export const maternityLeavesToMaternityLeavesMonth = (
  maternityLeaves: number
): number => {
  return maternityLeaves * 6;
};

export const convertVibeCodedEmploymentTypeToPrzemekType = (
  vibeType: "UoP" | "JDG"
): PeriodType => {
  switch (vibeType) {
    case "UoP":
      return PeriodType.UOP;
    case "JDG":
      return PeriodType.SELF_EMPLOYED;
  }
};
