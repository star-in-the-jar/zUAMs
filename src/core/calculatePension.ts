import { type Gender } from "@/const/genders";

type PensionArgs = {
  age: number;
  gender: Gender;
  retirementAge: number;
};

export const calculatePension = (pensionArgs: PensionArgs): number => {
  const { age, retirementAge } = pensionArgs;

  const pensionResult = 1000 + (retirementAge - age) * 100;

  return pensionResult;
};
