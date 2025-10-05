import React from "react";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import SectionWorkAndSalary from "@/components/SectionWorkAndSalary";
import SectionLeavesAndBreaks from "@/components/SectionLeavesAndBreaks";
import SectionSavings from "@/components/SectionSavings";
import { calculatePension } from "@/core/calculatePension";
import { GENDERS } from "@/const/genders";
import ErrorIcon from "@mui/icons-material/Error";
import { MAX_AGE, MIN_AGE } from "@/const/age";

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

const Result: React.FC = () => {
  const snap = useSnapshot(appState);

  const getAlertText = () => {
    switch (snap.gender) {
      case GENDERS.MALE:
        return "Pola oznaczone kolorem żółtym mają domyślne wartości statystycznego Polaka";
      case GENDERS.FEMALE:
        return "Pola oznaczone kolorem żółtym mają domyślne wartości statystycznej Polki";
      default:
        return "Pola oznaczone kolorem żółtym mają domyślne wartości statystycznego Polaka/Polki";
    }
  };

  React.useEffect(() => {
    if (!snap.gender) {
      setAndMarkAsChanged("gender", GENDERS.MALE);
    }
  }, []);

  return (
    <div className="flex flex-col items-center pb-20 min-h-screen">
      <div className="w-full max-w-2xl">
        <h1 className="mb-6 font-semibold text-primary text-4xl">
          Zakładając, że
        </h1>
        <div className="alert bg-accent/30 text-accent-content">
          <ErrorIcon />
          {getAlertText()}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="font-medium label-text">
              W jakim wieku przejdziesz na emeryturę?
            </span>
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
          </div>
          <div className="label">
            <span className="label-text-alt text-base-content/60">
              Czyli w {getRetirementYear(snap.age, snap.retirementAge)} roku
            </span>
          </div>
        </div>
        <form className="mb-6">
          <div className="flex flex-col gap-y-4 w-full">
            <div className="collapse collapse-arrow bg-primary/5 text-primary">
              <input type="checkbox" className="collapse-toggle" />
              <div className="collapse-title font-medium text-xl">
                Więcej opcji
              </div>
              <div className="collapse-content">
                <div className="flex flex-col gap-y-6 pt-4">
                  <SectionWorkAndSalary />
                  <SectionLeavesAndBreaks />
                  <SectionSavings />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bottom-5 left-1/2 fixed bg-white shadow-md p-4 px-6 border border-base-200 rounded-full text-base -translate-x-1/2">
        Otrzymasz emeryturę w wysokości&nbsp;
        <span className="font-bold text-primary">
          {calculatePension({
            age: snap.age,
            retirementAge: snap.retirementAge,
            gender: snap.gender ?? GENDERS.MALE,
          })}
        </span>
        &nbsp;zł miesięcznie (netto)
      </div>
    </div>
  );
};

export default Result;
