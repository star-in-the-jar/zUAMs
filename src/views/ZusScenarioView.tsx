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
  const EXPECTED_PENSION = 6500;
  const basePensionFromState = Number(snap.pension) || 0;
  const hardcodedBasePension = 6500;
  const currentPension = basePensionFromState || hardcodedBasePension;
  const isMale = snap.gender === GENDERS.MALE || snap.gender === undefined;
  const startWorkingYear =
    new Date().getFullYear() - (snap.age - START_WORKING_AGE);
  const statsDelay = isMale ? STATS_DELAY_YEARS.MALE : STATS_DELAY_YEARS.FEMALE;
  const statsRetirementAge = snap.retirementAge + statsDelay;
  const yearsToRetirement = statsRetirementAge - snap.age;
  const retirementYear =
    new Date().getFullYear() + Math.floor(yearsToRetirement);
  const MOCK_AVG_MONTHS = 1;

  const baseConfig: ZusRetirementConfig = useMemo(
    () => ({
      employmentPeriods: getMockEmploymentPeriods(
        startWorkingYear,
        retirementYear,
        snap.currentMonthlySalary || 5000
      ),
      gender: snap.gender ?? GENDERS.MALE,
      simStartYear: startWorkingYear,
      retirementYear: retirementYear,
      retirementMonth: 1,
      avgMonthsAliveAfterRetirement: MOCK_AVG_MONTHS,
      monthsOfStudying: 0,
      yearlyValorizationCoef: (year: number) => 1.005, // Zmniejszona dla urealnienia
      yearlyRetirementValorizationMul: () => 1.005,
      additionalSavings: 0,
      yearlyAdditionalSavingsValorizationMul: () => 1.02,
      collectedZusBenefits: 0,
      averageSickDays: false,
      monthsMaternityLeave: 0,
    }),
    [
      snap.age,
      snap.retirementAge,
      snap.gender,
      snap.currentMonthlySalary,
      retirementYear,
    ]
  );

  const baseResultForSim = calculateZusRetirement(baseConfig);
  const currentPensionFromSim = baseResultForSim.monthlyRetirementAmount(0);

  const calculateScenarioPensionPureGain = (addedYears: number) => {
    const newRetirementAge = snap.retirementAge + addedYears;
    const newRetirementYear =
      new Date().getFullYear() + (newRetirementAge - snap.age);

    const scenarioConfig: ZusRetirementConfig = {
      ...baseConfig,
      retirementYear: newRetirementYear,
      avgMonthsAliveAfterRetirement: MOCK_AVG_MONTHS,
      employmentPeriods: getMockEmploymentPeriods(
        startWorkingYear,
        newRetirementYear,
        snap.currentMonthlySalary || 5000
      ),
    };

    const result = calculateZusRetirement(scenarioConfig);
    const newPensionFromSim = result.monthlyRetirementAmount(0);

    // Zysk to różnica: Nowa kwota z symulacji - Stara kwota z symulacji
    const zusGain = newPensionFromSim - currentPensionFromSim;

    // Funkcja zwraca tylko różnicę
    return zusGain;
  };

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
    const zusRetirementVariant = simPensionByStartingAfterYears({
      ...snap,
      retirementAge: snap.retirementAge + scenario.years
    });
    const finalRetirementYear = getRetirementYear(
      snap.age,
      snap.retirementAge,
      scenario.years
    );

    const deltaRetirement = zusRetirementVariant - snap.pension

    return (
      <div className="bg-white shadow-sm hover:shadow-lg p-6 border border-gray-200 rounded-2xl transition-all duration-200">
        <div className="flex justify-center items-center gap-2 mb-3 font-bold text-primary text-xl">
          <PresentationChartLineIcon className="w-6 h-6" />
          {scenario.label}
        </div>

        <div className="mb-4 text-center">
          <p className="text-gray-500 text-sm">Wydłużenie pracy</p>
          <p className="font-semibold text-success text-2xl">
            +{scenario.years} lata
          </p>
          <p className="text-gray-400 text-xs">
            Emerytura od {finalRetirementYear} r.
          </p>
        </div>

        <div className="mb-4 text-center">
          <p className="text-gray-500 text-sm">Różnica</p>
          <p className="font-bold text-success text-xl">
            +{Math.round(deltaRetirement)} zł
          </p>
        </div>

        <div className="pt-4 border-gray-100 border-t text-center">
          <p className="font-medium text-gray-600 text-sm">Nowa emerytura</p>
          <p className={`text-4xl font-extrabold text-primary`}>
            {Math.round(zusRetirementVariant)} zł
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-md p-8 rounded-2xl min-h-screen text-base-content">
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

      <div className="shadow-lg mx-auto mt-10 max-w-4xl alert alert-info">
        <span>
          Czy wiedziałeś, że zostając na emeryturze powyżej 2 lat względem
          ustawowego wieku emerytalnego, należysz do 3,7% społeczeństwa w
          przypadku mężczyzn 8,5% w przypadku kobiet? (dane z r.2024). Względem
          roku 2022 odnotowano w tej grupie spadek o kolejno: 0,1% dla mężczyzn
          o 0,3% dla kobiet.
        </span>
      </div>
      <div className="shadow-lg mx-auto mt-6 max-w-4xl alert alert-info">
        <span>
          Warto jednak zaznaczyć, że w przeciągu dwóch lat (2022-2024)
          odnotowano spadek osób przechodzących na emeryturę równo w wieku
          emerytalnym (o 3,9% w przypadku mężczyzn i 2,4% w przypadku kobiet).
          Oznacza to, że coraz więcej osób przechodzi na emeryturę później w
          celu uzyskania wyższych składek emerytalnych.
        </span>
      </div>
    </div>
  );
};

export default ZusScenarioView;
