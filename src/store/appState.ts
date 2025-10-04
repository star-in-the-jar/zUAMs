import type { Gender } from "@/const/genders";
import { proxy } from "valtio";

export type AppState = {
  pension: string;
  lastValid: string;
  gender: Gender | undefined;
  age: number;
  retirementAge: number;
};

// Global app state for pension and related values
export const appState = proxy<AppState>({
  pension: "",
  lastValid: "",
  gender: undefined,
  age: 20,
  retirementAge: 75,
});
