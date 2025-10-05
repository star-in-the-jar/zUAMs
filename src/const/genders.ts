export const GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export const GENDERS_ON_POLISH = {
  [GENDERS.MALE]: "Mężczyzna",
  [GENDERS.FEMALE]: "Kobieta",
};

export type Gender = keyof typeof GENDERS;
