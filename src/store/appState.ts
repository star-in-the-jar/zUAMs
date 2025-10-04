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

export const wasAppStateFieldChanged: Record<keyof AppState, boolean> = {
  pension: false,
  lastValid: false,
  gender: false,
  age: false,
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
};

// Global app state for pension and related values
export const appState = proxy<AppState>({
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
