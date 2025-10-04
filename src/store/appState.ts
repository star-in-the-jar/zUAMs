import { proxy } from "valtio";

// Global app state for pension and related values
export const appState = proxy({
  pension: "",
  lastValid: ""
});
