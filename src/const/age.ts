import { GENDERS } from "./genders";

export const RETIREMENT_AGE = {
  [GENDERS.MALE]: 65,
  [GENDERS.FEMALE]: 60,
} as const;

export const MEDIAN_LIVE_AGE = {
  [GENDERS.MALE]: 74.7,
  [GENDERS.FEMALE]: 82,
} as const;

export const MIN_AGE = 16;
export const MAX_AGE = 91;

export const MIN_AGE_TO_WORK = 16;
