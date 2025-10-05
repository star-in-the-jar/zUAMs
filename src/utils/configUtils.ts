import { RETIREMENT_AGE, MEDIAN_LIVE_AGE } from "@/const/age";
import type { Gender } from "@/const/genders";
import { PeriodType } from "@/sim";

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
  gender: Gender
): number => {
  const medianLiveAge = MEDIAN_LIVE_AGE[gender];
  if (desiredRetirementAge >= medianLiveAge) {
    return 12;
  }
  const yearsAfterRetirement = medianLiveAge - desiredRetirementAge;
  return yearsAfterRetirement * 12;
};

export const maternityLeavesToMaternityLeavesMonth = (
  maternityLeaves: number
): number => {
  return maternityLeaves * 5;
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
