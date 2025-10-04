import React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";

const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  appState.employmentType = e.target.value as "UoP" | "JDG";
};

const handleCurrentMonthlySalaryChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    appState.currentMonthlySalary = num;
  }
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
    <div className="bg-white card text-base-content">
      <div className="p-4 card-body">
        <h3 className="mb-4 text-lg card-title text-primary">
          Praca i zarobki
        </h3>
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-1">
            <label className="label">
              <span className="font-medium label-text">Typ zatrudnienia</span>
            </label>
            <div className="join">
              <input
                className="join-item btn"
                type="radio"
                name="employmentType"
                value="UoP"
                checked={snap.employmentType === "UoP"}
                onChange={handleEmploymentTypeChange}
                aria-label="UoP"
              />
              <input
                className="join-item btn"
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
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">
                Aktualne wynagrodzenie netto
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                value={snap.currentMonthlySalary}
                className="input-bordered w-32 input"
                type="number"
                min="0"
                onChange={handleCurrentMonthlySalaryChange}
              />
              <span className="text-sm">zł miesięcznie</span>
            </div>
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Twoje aktualne miesięczne wynagrodzenie netto
              </span>
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">
                Wynagrodzenie brutto
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                value={snap.monthlyGrossSalary}
                className="input-bordered w-32 input"
                type="number"
                min="0"
                onChange={handleMonthlyGrossSalaryChange}
              />
              <span className="text-sm">PLN brutto miesięcznie</span>
            </div>
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Twoje miesięczne wynagrodzenie brutto
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionWorkAndSalary;
