import type { Gender } from "@/const/genders";
import { proxy } from "valtio";

export type AppState = {
  pension: number;
  lastValid: string;
  gender: Gender | undefined;
  age: number;
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
};

// Global app state for pension and related values
export const DEFAULT_APP_STATE: AppState = proxy<AppState>({
  pension: 0,
  lastValid: "",
  gender: undefined,
  age: 20,
  retirementAge: 75,
  salary: undefined,
  // Advanced options defaults
  maternityLeaves: 0,
  monthlyGrossSalary: 0,
  employmentType: "UoP",
  averageSickDays: true,
  additionalSavings: 0,
  currentMonthlySalary: 0,
  collectedZusBenefits: 0,
});

// Global app state for pension and related values
export const appState = proxy<AppState>({
  pension: DEFAULT_APP_STATE.pension,
  lastValid: DEFAULT_APP_STATE.lastValid,
  gender: DEFAULT_APP_STATE.gender,
  age: DEFAULT_APP_STATE.age,
  retirementAge: DEFAULT_APP_STATE.retirementAge,
  salary: DEFAULT_APP_STATE.salary,
  // Advanced options defaults
  maternityLeaves: DEFAULT_APP_STATE.maternityLeaves,
  monthlyGrossSalary: DEFAULT_APP_STATE.monthlyGrossSalary,
  employmentType: DEFAULT_APP_STATE.employmentType,
  averageSickDays: DEFAULT_APP_STATE.averageSickDays,
  additionalSavings: DEFAULT_APP_STATE.additionalSavings,
  currentMonthlySalary: DEFAULT_APP_STATE.currentMonthlySalary,
  collectedZusBenefits: DEFAULT_APP_STATE.collectedZusBenefits,
});
