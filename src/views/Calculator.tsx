import React from "react";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import SectionBasicData from "@/components/SectionBasicData";
import SectionLeavesAndBreaks from "@/components/SectionLeavesAndBreaks";
import SectionSavings from "@/components/SectionSavings";
import { calculatePension } from "@/core/calculatePension";
import { GENDERS } from "@/const/genders";
import ErrorIcon from "@mui/icons-material/Error";
import { MEDIAN_GROSS_SALARIES } from "@/const/salary";
import ZusScenarioView from "./ZusScenarioView";
import SavingsScenarioView from "./SavingsScenarioView";

const Result: React.FC = () => {
  const snap = useSnapshot(appState);

  const getAlertText = () => {
    const prefixText = "Pola oznaczone kolorem żółtym mają domyślne wartości";
    const suffixText = "i mogą być zmienione";
    let middleText;
    switch (snap.gender) {
      case GENDERS.MALE:
        middleText = "statystycznego Polaka";
        break;
      case GENDERS.FEMALE:
        middleText = "statystycznej Polki";
        break;
      default:
        middleText = "statystycznego Polaka/Polki";
    }
    return `${prefixText} ${middleText} ${suffixText}`;
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
        <div className="bg-accent/30 mb-4 text-accent-content alert">
          <ErrorIcon />
          {getAlertText()}
        </div>
        <h1 className="mb-4 font-semibold text-primary text-4xl">
          Zakładając, że
        </h1>
        <div className="mb-12">
          <SectionBasicData />
        </div>

        <form className="mb-6">
          <div className="flex flex-col gap-y-4 w-full">
            {/* 1. WIĘCEJ OPCJI (URLOP/OSZCZĘDNOŚCI) */}
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

            {/* 2. SCENARIUSZE ZUS */}
            <div className="collapse collapse-arrow bg-primary/5 mt-6 text-primary">
              <input type="checkbox" className="collapse-toggle" />
              <div className="collapse-title font-medium text-xl">
                Scenariusze ZUS
              </div>
              <div className="collapse-content">
                <ZusScenarioView />
              </div>
            </div>

            {/* 3. SCENARIUSZE OSZCZĘDNOŚCI (POPRAWIONY BLOK) */}
            <div className="collapse collapse-arrow bg-primary/5 mt-6 text-primary">
              <input type="checkbox" className="collapse-toggle" />
              <div className="collapse-title font-medium text-xl">
                Scenariusze Oszczędności
              </div>
              <div className="collapse-content">
                <SavingsScenarioView />
              </div>
            </div>
          </div>
        </form>
        <div className="mb-6 text-xs text-base-content/70">
          Wszystkie podane i oczekiwane wartości uwzględniają inflację. Należy
          traktować podane wartości jako siłę nabywczą na dzień dzisiejszy.
        </div>
        <span></span>

        {/* Dodajemy nowy komponent w rozwijanej sekcji */}
        <div className="collapse collapse-arrow bg-primary/5 mt-6 text-primary">
          <input type="checkbox" className="collapse-toggle" />
          <div className="collapse-title font-medium text-xl">
            Scenariusze ZUS
          </div>
          <div className="collapse-content">
            <ZusScenarioView />
          </div>
        </div>
      </div>

      <div className="bottom-5 left-1/2 fixed bg-white shadow-md p-4 px-6 border border-base-200 rounded-full text-base -translate-x-1/2">
        Otrzymasz emeryturę w wysokości&nbsp;
        <span className="font-bold text-primary">{calculatePension(snap)}</span>
        &nbsp;miesięcznie (netto)
      </div>
    </div>
  );
};

export default Result;
