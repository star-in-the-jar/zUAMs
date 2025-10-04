import { GENDERS, type Gender } from "@/const/genders";

type PensionArgs = {
  age: number;
  gender: Gender;
  retirementAge: number;
};

export const calculatePension = (pensionArgs: PensionArgs): number => {
  const { age, gender, retirementAge } = pensionArgs;

  let pensionResult = 1000 + (retirementAge - age) * 100;

  if (gender === GENDERS.FEMALE) {
    pensionResult /= 2;
  }

  return pensionResult;
};
