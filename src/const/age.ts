import { GENDERS } from "./genders";

export const RETIREMENT_AGE = {
  [GENDERS.MALE]: 65,
  [GENDERS.FEMALE]: 60,
} as const;

export const MIN_AGE = 20;
export const MAX_AGE = 120;
