export const GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export type Gender = keyof typeof GENDERS;
