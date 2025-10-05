import type { Gender } from "@/const/genders";
import { proxy } from "valtio";

export type AppState = {
  pension: number;
  lastValid: string;
  gender: Gender | undefined;
  age: number;
  workSinceAge: number;
  retirementAge: number;
  salary?: number;
  // Advanced options
  maternityLeaves: number;
  monthlyGrossSalary: number;
  employmentType: "UoP" | "JDG";
  averageSickDays: boolean;
  additionalSavings: number;
  currentMonthlySalary: number;
  collectedZusBenefits: number;
  // JDG (self-employment) options
  jdgStartYear?: number;
  yearsOnJdg?: number;
  monthlyJdgZusContribution?: number;
};

export const wasAppStateFieldChanged: Record<keyof AppState, boolean> = {
  pension: false,
  lastValid: false,
  gender: false,
  age: false,
  workSinceAge: false,
  retirementAge: false,
  salary: false,
  // Advanced options
  maternityLeaves: false,
  monthlyGrossSalary: false,
  employmentType: false,
  averageSickDays: false,
  additionalSavings: false,
  currentMonthlySalary: false,
  collectedZusBenefits: false,
  // JDG options
  jdgStartYear: false,
  yearsOnJdg: false,
  monthlyJdgZusContribution: false,
};

// Global app state for pension and related values
export const appState = proxy<AppState>({
  pension: 0,
  lastValid: "",
  gender: undefined,
  age: 20,
  workSinceAge: 20,
  retirementAge: 70,
  salary: undefined,
  // Advanced options defaults
  maternityLeaves: 0,
  monthlyGrossSalary: 0,
  employmentType: "UoP",
  averageSickDays: true,
  additionalSavings: 0,
  currentMonthlySalary: 0,
  collectedZusBenefits: 0,
  // JDG defaults
  jdgStartYear: undefined,
  yearsOnJdg: undefined,
  monthlyJdgZusContribution: undefined,
});

export const setAndMarkAsChanged = <K extends keyof AppState>(
  key: K,
  value: AppState[K]
) => {
  appState[key] = value;
  wasAppStateFieldChanged[key] = true;
};
