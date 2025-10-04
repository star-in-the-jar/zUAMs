import type React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import SectionAgeAndRetirement from "@/components/SectionAgeAndRetirement";
import SectionWorkAndSalary from "@/components/SectionWorkAndSalary";
import SectionLeavesAndBreaks from "@/components/SectionLeavesAndBreaks";
import SectionSavings from "@/components/SectionSavings";
import { calculatePension } from "@/core/calculatePension";
import { GENDERS } from "@/const/genders";

const Result: React.FC = () => {
  const snap = useSnapshot(appState);

  return (
    <div className="flex flex-col items-center pb-20 min-h-screen">
      <h1 className="font-semibold text-primary text-3xl">
        Zakładając, że
      </h1>
      <form className="">
        <div className="flex flex-col gap-y-4 w-full max-w-2xl">
          <SectionAgeAndRetirement />
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
      <div className="bottom-5 left-1/2 fixed bg-white shadow-md p-4 px-6 border border-base-200 rounded-full text-l -translate-x-1/2">
        Otrzymasz emeryturę w wysokości&nbsp;
        <span className="font-bold text-primary">
          {calculatePension({
            age: snap.age,
            retirementAge: snap.retirementAge,
            gender: snap.gender ?? GENDERS.MALE,
          })}
        </span>
        &nbsp; PLN netto
      </div>
    </div>
  );
};

export default Result;
