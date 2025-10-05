import React from "react";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import { MIN_AGE, MAX_AGE } from "@/const/age";
import UnchangedField from "./UnchangedField";

const SectionBasicData: React.FC = () => {
  const snap = useSnapshot(appState);

  const handleEmploymentTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAndMarkAsChanged("employmentType", e.target.value as "UoP" | "JDG");
  };

  const handleWorkSinceAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = Number(val);
    if (!isNaN(num) && num >= 0) {
      setAndMarkAsChanged("workSinceAge", num);
    }
  };

  const handleRetirementAgeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;
    const num = Number(val);
    if (!isNaN(num) && num > MIN_AGE && num < MAX_AGE) {
      setAndMarkAsChanged("retirementAge", num);
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

  // Logika obliczeń
  const yearsWorked = Math.max(0, snap.age - snap.workSinceAge);
  const minStaz = snap.gender === "FEMALE" ? 20 : 25;
  const minStazAchieveAge = snap.workSinceAge + minStaz;
  const formatYears = (count: number) => (count === 1 ? "rok" : "lat");

  return (
    <div className="bg-white text-base-content card">
      <div className="p-0 card-body">
        {/* <h2 className="text-primary text-xl card-title">Podstawowe dane</h2> */}
        <div className="flex flex-col gap-y-4">
          <UnchangedField field="retirementAge">
            <div className="form-control">
              <label>
                <span className="font-medium label-text">
                  Przedziesz na emeryturę w wieku
                </span>
                <div className="w-full input">
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
              </label>
            </div>
          </UnchangedField>

          <UnchangedField field="employmentType">
            <div className="flex flex-col gap-y-1 w-full">
              <label className="label">
                <span className="font-medium label-text">Pracujesz na</span>
              </label>
              <div className="w-full join">
                <input
                  className="w-1/2 join-item btn"
                  type="radio"
                  name="employmentType"
                  value="UoP"
                  checked={snap.employmentType === "UoP"}
                  onChange={handleEmploymentTypeChange}
                  aria-label="UoP"
                />
                <input
                  className="w-1/2 join-item btn"
                  type="radio"
                  name="employmentType"
                  value="JDG"
                  checked={snap.employmentType === "JDG"}
                  onChange={handleEmploymentTypeChange}
                  aria-label="JDG"
                />
              </div>
              <div className="label text-wrap">
                Umowa o pracę (UoP) lub Jednoosobowa działalność gospodarcza
                (JDG)
              </div>
            </div>
          </UnchangedField>

          <UnchangedField field="monthlyGrossSalary">
            <div className="flex flex-col gap-y-1 w-full">
              <label>
                <span className="font-medium label-text">
                  Zarabiasz miesięcznie
                </span>
                <div className="w-full input">
                  <input
                    value={snap.monthlyGrossSalary}
                    className="grow"
                    type="number"
                    min="0"
                    onChange={handleMonthlyGrossSalaryChange}
                  />
                  zł brutto
                </div>
              </label>
            </div>
          </UnchangedField>

          <UnchangedField field="workSinceAge">
            <div className="flex flex-col gap-y-1 w-full">
              <label>
                <span className="font-medium label-text">
                  Zacząłeś/zaczniesz pracować w wieku
                </span>
                <div className="w-full input">
                  <input
                    value={snap.workSinceAge}
                    className="grow"
                    type="number"
                    min="0"
                    onChange={handleWorkSinceAgeChange}
                  />
                  lat
                </div>
              </label>
            </div>
          </UnchangedField>

          <div className="-mt-3 pt-1 label">
            <span className="label-text-alt text-xs text-wrap w-full text-base-content/70">
              Twój obecny staż pracy to {yearsWorked} {formatYears(yearsWorked)}
              . Minimalny wymagany staż (do minimalnej emerytury) to {minStaz}{" "}
              lat. Osiągniesz go w wieku {minStazAchieveAge} lat.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionBasicData;
