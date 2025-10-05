import React from "react";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import SectionWorkAndSalary from "@/components/SectionWorkAndSalary";
import SectionLeavesAndBreaks from "@/components/SectionLeavesAndBreaks";
import SectionSavings from "@/components/SectionSavings";
import { calculatePension } from "@/core/calculatePension";
import { GENDERS } from "@/const/genders";
import ErrorIcon from "@mui/icons-material/Error";
import { MEDIAN_GROSS_SALARIES } from "@/const/salary";

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
      appState.monthlyGrossSalary = MEDIAN_GROSS_SALARIES[GENDERS.MALE];
    }
  }, []);

  return (
    <div className="flex flex-col items-center pb-20">
      <div className="w-full max-w-2xl">
        <h1 className="mb-4 font-semibold text-primary text-4xl">
          Zakładając, że
        </h1>
        <div className="alert bg-accent/30 text-accent-content mb-12">
          <ErrorIcon />
          {getAlertText()}
        </div>
        <div className="mb-12">
          <SectionWorkAndSalary />
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
