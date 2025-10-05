import type React from "react";
import { useMemo } from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import { GENDERS } from "@/const/genders";
import {
  calculateZusRetirement,
  type ZusRetirementConfig,
  type UoPPeriod,
  PeriodType,
} from "@/sim/zus";
import {
  ClockIcon,
  BanknotesIcon,
  PresentationChartLineIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { simPensionByStartingAfterYears } from "@/core/calculatePension";

interface Scenario {
  years: number;
  label: string;
}

const scenarios: Scenario[] = [
  { years: 2, label: "+ 2 lata" },
  { years: 4, label: "+ 4 lata" },
  { years: 8, label: "+ 8 lat" },
];

const START_WORKING_AGE = 25;
const STATS_DELAY_YEARS = { MALE: 0.17, FEMALE: 0.29 };

function getMockEmploymentPeriods(
  startYear: number,
  endYear: number,
  monthlyGrossSalary: number
): UoPPeriod[] {
  return [
    {
      type: PeriodType.UOP,
      from: { year: startYear, month: 1 },
      to: { year: endYear, month: 12 },
      grossMonthlySalary: () => monthlyGrossSalary,
    },
  ];
}

const ZusScenarioView: React.FC = () => {
  const snap = useSnapshot(appState);

  const getRetirementYear = (
    age: number,
    retirementAge: number,
    addedYears: number
  ) => {
    const currentYear = new Date().getFullYear();
    const yearsToRetirement = retirementAge + addedYears - age;
    return currentYear + Math.floor(yearsToRetirement);
  };

  const ScenarioCard: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
    const zusGain = simPensionByStartingAfterYears(snap, scenario.years);
    const pensionAfterZus = snap.pension + zusGain;
    console.log(scenario.years, zusGain);
    const finalRetirementYear = getRetirementYear(
      snap.age,
      snap.retirementAge,
      scenario.years
    );

    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-center gap-2 text-primary font-bold text-xl mb-3">
          <PresentationChartLineIcon className="w-6 h-6" />
          {scenario.label}
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Wydłużenie pracy</p>
          <p className="text-2xl text-success font-semibold">
            +{scenario.years} lata
          </p>
          <p className="text-xs text-gray-400">
            Emerytura od {finalRetirementYear} r.
          </p>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Zysk z ZUS (miesięcznie)</p>
          <p className="text-xl text-success font-bold">
            +{Math.round(zusGain)} zł
          </p>
        </div>

        <div className="text-center border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600 font-medium">PO ZYSKU Z ZUS</p>
          <p className={`text-4xl font-extrabold text-primary`}>
            {Math.round(pensionAfterZus)} zł
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white text-base-content rounded-2xl min-h-screen p-8 shadow-md">
      <h1 className="mb-8 pb-3 border-primary/50 border-b-4 font-bold text-primary text-4xl text-center">
        ZUS: Dłuższa Praca
      </h1>

      <p className="mb-8 text-gray-600 text-lg text-center">
        Bazowa emerytura (prognoza ZUS):{" "}
        <span className="font-bold text-primary">
          {Math.round(snap.pension)} zł/mc
        </span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.years} scenario={scenario} />
        ))}
      </div>

      <div className="mt-10 space-y-4 max-w-4xl mx-auto">
        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl shadow-sm">
          <InformationCircleIcon className="w-6 h-6 text-blue-500 mt-1" />
          <p className="text-sm text-blue-700">
            Tylko 3,7% mężczyzn i 8,5% kobiet pracuje dłużej niż 2 lata po
            osiągnięciu wieku emerytalnego (dane z 2024 r.). Względem 2022 r. to
            spadek o 0,1% dla mężczyzn i 0,3% dla kobiet.
          </p>
        </div>

        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl shadow-sm">
          <InformationCircleIcon className="w-6 h-6 text-blue-500 mt-1" />
          <p className="text-sm text-blue-700">
            Coraz więcej osób przechodzi na emeryturę później, by uzyskać wyższe
            świadczenia — w latach 2022–2024 liczba osób odchodzących dokładnie
            w wieku emerytalnym spadła o 3,9% u mężczyzn i 2,4% u kobiet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZusScenarioView;
