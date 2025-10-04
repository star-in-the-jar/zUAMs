import React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import GenderButtons from "@/components/GenderButtons";
import { MIN_AGE, MAX_AGE } from "@/const/age";

const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num > MIN_AGE && num < MAX_AGE) {
    appState.age = num;
    appState.retirementAge = Math.max(appState.retirementAge, num);
  }
};

const handleRetirementAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num > MIN_AGE && num < MAX_AGE) {
    appState.retirementAge = num;
    appState.age = Math.min(appState.age, num);
  }
};

const getRetirementYear = (age: number, retirementAge: number) => {
  const currentYear = new Date().getFullYear();
  const yearsToRetirement = retirementAge - age;
  return currentYear + yearsToRetirement;
};

const SectionAgeAndRetirement: React.FC = () => {
  const snap = useSnapshot(appState);
  return (
    <div className="bg-white card text-base-content">
      <div className="card-body">
        <h3 className="mb-4 text-lg text-primary card-title">
          Wiek i emerytura
        </h3>
        <div className="flex flex-col gap-y-4">
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">Płeć</span>
            </label>
            <GenderButtons />
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Wpływa na wiek emerytalny
              </span>
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">Obecny wiek</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                value={snap.age}
                className="input-bordered w-20 input"
                type="number"
                min={MIN_AGE}
                max={MAX_AGE}
                onChange={handleAgeChange}
              />
              <span className="text-sm">lat</span>
            </div>
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Twój aktualny wiek
              </span>
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">Wiek emerytalny</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                value={snap.retirementAge}
                className="input-bordered w-20 input"
                type="number"
                min={MIN_AGE}
                max={MAX_AGE}
                onChange={handleRetirementAgeChange}
              />
              <span className="text-sm">lat</span>
              <span className="text-sm text-base-content/60">
                ({getRetirementYear(snap.age, snap.retirementAge)} r.)
              </span>
            </div>
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Kiedy planujesz przejść na emeryturę
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionAgeAndRetirement;
