import React from "react";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import UnchangedField from "./UnchangedField";
import { MAX_AGE, MIN_AGE } from "@/const/age";

const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setAndMarkAsChanged("employmentType", e.target.value as "UoP" | "JDG");
};

const handleRetirementAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num > MIN_AGE && num < MAX_AGE) {
    appState.retirementAge = num;
    appState.age = Math.min(appState.age, num);
  }
};

const handleMonthlyGrossSalaryChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    setAndMarkAsChanged("monthlyGrossSalary", num);
  }
};

const SectionWorkAndSalary: React.FC = () => {
  const snap = useSnapshot(appState);
  return (
    <div className="bg-white text-base-content card">
      <div className="p-0 card-body">
        <h2 className="text-xl card-title text-primary">Podstawowe dane</h2>
        <div className="flex flex-col gap-y-4">
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">
                W jakim wieku przejdziesz na emeryturę?
              </span>
            </label>
            <div className="input w-full">
              <input
                value={snap.retirementAge}
                className="grow"
                type="number"
                min={MIN_AGE}
                max={MAX_AGE}
                onChange={handleRetirementAgeChange}
              />
              lat
            </div>
          </div>

          <UnchangedField field="employmentType">
            <div className="flex flex-col gap-y-1 w-full">
              <label className="label">
                <span className="font-medium label-text">Typ zatrudnienia</span>
              </label>
              <div className="join w-full">
                <input
                  className="join-item btn w-1/2"
                  type="radio"
                  name="employmentType"
                  value="UoP"
                  checked={snap.employmentType === "UoP"}
                  onChange={handleEmploymentTypeChange}
                  aria-label="UoP"
                />
                <input
                  className="join-item btn w-1/2"
                  type="radio"
                  name="employmentType"
                  value="JDG"
                  checked={snap.employmentType === "JDG"}
                  onChange={handleEmploymentTypeChange}
                  aria-label="JDG"
                />
              </div>
              <div className="label">
                <span className="label-text-alt text-base-content/60">
                  Umowa o pracę (UoP) lub Jednoosobowa działalność gospodarcza
                  (JDG)
                </span>
              </div>
            </div>
          </UnchangedField>
          <UnchangedField field="monthlyGrossSalary">
            <div className="flex flex-col gap-y-1 w-full">
              <label>
                <span className="font-medium label-text">
                  Wynagrodzenie miesięczne brutto
                </span>
                <div className="input w-full">
                  <input
                    value={snap.monthlyGrossSalary}
                    className="grow"
                    type="number"
                    min="0"
                    onChange={handleMonthlyGrossSalaryChange}
                  />
                  PLN
                </div>
              </label>
            </div>
          </UnchangedField>
        </div>
      </div>
    </div>
  );
};

export default SectionWorkAndSalary;
