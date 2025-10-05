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
} from "@heroicons/react/24/outline";

interface Scenario {
  years: number; // 2, 4, 8 lat wydłużenia pracy
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
      monthsMaternityLeave: 0,
      yearlyValorizationCoef: (year: number) => 1.005,
      yearlyRetirementValorizationMul: (yearFromStart: number) => 1.005,
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

  const getColorClass = (value: number) => {
    const roundedValue = Math.round(value);
    if (roundedValue >= EXPECTED_PENSION) return "text-success";
    if (roundedValue < EXPECTED_PENSION) return "text-error";
    return "text-base-content";
  };

  const ScenarioColumn: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
    const zusGain = calculateScenarioPensionPureGain(scenario.years);
    const pensionAfterZus = currentPension + zusGain;
    const finalRetirementYear = getRetirementYear(
      snap.age,
      snap.retirementAge,
      scenario.years
    );
    const colorAfterZus = getColorClass(pensionAfterZus);

    return (
      <div className="card w-full bg-base-100 shadow-xl border border-primary/20">
        <div className="card-body p-5">
          <h2 className="card-title text-2xl justify-center text-primary mb-3 border-b-2 border-primary/50 pb-2">
            <PresentationChartLineIcon className="w-6 h-6 mr-2" />
            {scenario.label}
          </h2>

          <div className="stats stats-vertical shadow bg-base-200 mb-4">
            <div className="stat place-items-center p-3">
              <div className="stat-title flex items-center text-info">
                <ClockIcon className="w-5 h-5 mr-1" />
                Wydłużenie pracy
              </div>
              <div className="stat-value text-success flex items-center">
                +{scenario.years} lat
              </div>
              <div className="stat-desc text-sm">
                Emerytura od {finalRetirementYear} r.
              </div>
            </div>

            <div className="stat place-items-center p-3 border-t border-gray-300">
              <div className="stat-title text-info flex items-center">
                <BanknotesIcon className="w-5 h-5 mr-1" />
                Zysk z ZUS (mc)
              </div>
              <div className="stat-value text-success text-2xl">
                +{Math.round(zusGain)} zł
              </div>
            </div>

            <div className="stat place-items-center p-3 border-t border-primary/20 bg-base-300">
              <div className="stat-title text-base-content font-bold text-lg">
                PO ZYSKU Z ZUS:
              </div>
              <div
                className={`stat-value text-4xl font-extrabold ${colorAfterZus}`}
              >
                {Math.round(pensionAfterZus)} zł
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen rounded-2xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary border-b-4 border-primary/50 pb-3">
        ZUS: Dłuższa Praca
      </h1>

      <p className="text-center text-xl text-base-content/70 mb-8">
        Bazowa emerytura (zgodnie z prognozą ZUS):{" "}
        <span className="font-bold">{Math.round(currentPension)} zł/mc</span>
      </p>

      <div className="flex flex-col gap-6">
        {scenarios.map((scenario) => (
          <ScenarioColumn key={scenario.years} scenario={scenario} />
        ))}
      </div>

      <div className="collapse collapse-arrow bg-primary/5 text-primary mt-6">
        <input type="checkbox" className="collapse-toggle" />
        <div className="collapse-title font-medium text-xl">
          Dowiedz się więcej:
        </div>
        <div className="collapse-content">
          <div className="alert alert-info mt-6 shadow-lg max-w-4xl mx-auto text-xl">
            <span>
              Czy wiedziałeś, że zostając na emeryturze powyżej 2 lat względem
              ustawowego wieku emerytalnego, należysz do 3,7% społeczeństwa w
              przypadku mężczyzn i 8,5% w przypadku kobiet? (dane z r.2024).
              Względem roku 2022 odnotowano w tej grupie spadek o kolejno: 0,1%
              dla mężczyzn i 0,3% dla kobiet.
            </span>
          </div>

          <div className="alert alert-info mt-6 shadow-lg max-w-4xl mx-auto text-xl">
            <span>
              Warto jednak zaznaczyć, że w przeciągu dwóch lat (2022-2024)
              odnotowano spadek osób przechodzących na emeryturę równo w wieku
              emerytalnym (o 3,9% w przypadku mężczyzn i 2,4% w przypadku
              kobiet). Oznacza to, że coraz więcej osób decyduje się na
              późniejsze przejście na emeryturę w celu uzyskania wyższych
              składek emerytalnych.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZusScenarioView;
