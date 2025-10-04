import React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";

const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  appState.employmentType = e.target.value as "UoP" | "JDG";
};

const handleMonthlyGrossSalaryChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    appState.monthlyGrossSalary = num;
  }
};

const SectionWorkAndSalary: React.FC = () => {
  const snap = useSnapshot(appState);
  return (
    <div className="bg-white text-base-content card">
      <div className="p-4 card-body">
        <h3 className="mb-4 text-primary text-lg card-title">
          Praca i zarobki
        </h3>
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-1">
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
          <div className="flex flex-col gap-y-1">
            <label className="label">
              <span className="font-medium label-text">
                Wynagrodzenie miesięczne brutto
              </span>
            </label>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionWorkAndSalary;
