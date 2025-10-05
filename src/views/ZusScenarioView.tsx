import type React from "react";
import { useMemo } from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import { GENDERS } from "@/const/genders";

// IMPORTUJEMY PEŁNĄ LOGIKĘ ZUS SIMULATION
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

// STAŁE DANE DO WYLICZEŃ:
const START_WORKING_AGE = 25; // Wiek rozpoczęcia pracy (dla realistycznej symulacji)

// Statystycznie ważone opóźnienie przejścia (na podstawie danych ZUS 2024)
const STATS_DELAY_YEARS = { MALE: 0.17, FEMALE: 0.29 };

// UWAGA: Ta funkcja jest uproszczona, aby stworzyć bazowy okres zatrudnienia
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

  // 1. ZMIANA: Pobranie bazowej emerytury bezpośrednio z appState.pension
  const basePensionFromState = Number(snap.pension) || 0;
  const hardcodedBasePension = 6500;
  const currentPension = basePensionFromState || hardcodedBasePension;

  // 1. USTALENIE DANYCH BAZOWYCH
  const isMale = snap.gender === GENDERS.MALE || snap.gender === undefined;

  // Obliczenie realistycznego roku rozpoczęcia pracy
  const startWorkingYear =
    new Date().getFullYear() - (snap.age - START_WORKING_AGE);

  // ZASTOSOWANIE WAGI STATYSTYCZNEJ
  const statsDelay = isMale ? STATS_DELAY_YEARS.MALE : STATS_DELAY_YEARS.FEMALE;
  const statsRetirementAge = snap.retirementAge + statsDelay;

  const yearsToRetirement = statsRetirementAge - snap.age;
  const retirementYear =
    new Date().getFullYear() + Math.floor(yearsToRetirement);

  // MOCK_AVG_MONTHS = 1 jest wartością placeholder, ponieważ zus.ts powinien sam obliczyć dalsze trwanie życia
  const MOCK_AVG_MONTHS = 1;

  // Utworzenie bazowej konfiguracji dla STATYSTYCZNIE WAZONEGO wieku
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

  // BAZOWY WYNIK Z SIMULACJI ZUS (kwota emerytury tylko z symulacji)
  const baseResultForSim = calculateZusRetirement(baseConfig);
  const currentPensionFromSim = baseResultForSim.monthlyRetirementAmount(0);

  // 2. FUNKCJA DO OBLICZEŃ W SCENARIUSZU (+2, +4, +8 lat)
  // ZMIANA: Ta funkcja zwraca CZYSTĄ KWOTĘ ZYSKU, A NIE BAZA + ZYSK
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

    // WAŻNE: Funkcja zwraca tylko różnicę!
    return zusGain;
  };

  // --- POMOCNICY WIZUALNI ---
  function getRetirementYear(
    age: number,
    retirementAge: number,
    addedYears: number
  ) {
    const currentYear = new Date().getFullYear();
    const yearsToRetirement = retirementAge + addedYears - age;
    return currentYear + Math.floor(yearsToRetirement);
  }

  const getColorClass = (value: number) => {
    const roundedValue = Math.round(value);
    if (roundedValue >= EXPECTED_PENSION) return "text-success";
    if (roundedValue < EXPECTED_PENSION) return "text-error";
    return "text-base-content";
  };

  // --- KOMPONENT KOLUMNY ---
  const ScenarioColumn: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
    // POBIERAMY TYLKO CZYSTY ZYSK
    const zusGain = calculateScenarioPensionPureGain(scenario.years);

    // OBLICZAMY KWOTĘ KOŃCOWĄ: Bazowa kwota (6500) + Zysk z symulacji
    const pensionAfterZus = currentPension + zusGain;

    const finalRetirementYear = getRetirementYear(
      snap.age,
      snap.retirementAge,
      scenario.years
    );
    const colorAfterZus = getColorClass(pensionAfterZus);

    return (
      <div className="bg-base-100 shadow-xl border border-primary/20 w-full card">
        <div className="p-5 card-body">
          <h2 className="justify-center mb-3 pb-2 border-primary/50 border-b-2 text-primary text-2xl card-title">
            <PresentationChartLineIcon className="mr-2 w-6 h-6" />
            {scenario.label}
          </h2>

          <div className="bg-base-200 shadow mb-4 stats stats-vertical">
            <div className="place-items-center p-3 stat">
              <div className="flex items-center text-info stat-title">
                <ClockIcon className="mr-1 w-5 h-5" />
                Wydłużenie pracy
              </div>
              <div className="flex items-center text-success stat-value">
                +{scenario.years} lat
              </div>
              <div className="text-sm stat-desc">
                Emerytura od {finalRetirementYear} r.
              </div>
            </div>

            <div className="place-items-center p-3 border-gray-300 border-t stat">
              <div className="flex items-center text-info stat-title">
                <BanknotesIcon className="mr-1 w-5 h-5" />
                Zysk z ZUS (mc)
              </div>
              <div className="text-success text-2xl stat-value">
                +{Math.round(zusGain)} zł
              </div>
            </div>

            <div className="place-items-center bg-base-300 p-3 border-primary/20 border-t stat">
              <div className="font-bold text-base-content text-lg stat-title">
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
    <div className="bg-base-200 p-6 rounded-2xl min-h-screen">
      <h1 className="mb-8 pb-3 border-primary/50 border-b-4 font-bold text-primary text-4xl text-center">
        ZUS: Dłuższa Praca
      </h1>

      <p className="mb-8 text-base-content/70 text-xl text-center">
        Bazowa emerytura (zgodnie z prognozą ZUS):{" "}
        <span className="font-bold">{Math.round(currentPension)} zł/mc</span>
      </p>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        {scenarios.map((scenario) => (
          <ScenarioColumn key={scenario.years} scenario={scenario} />
        ))}
      </div>

      <div className="shadow-lg mx-auto mt-10 max-w-4xl text-xl alert alert-info">
        <span>
          Czy wiedziałeś, że zostając na emeryturze powyżej 2 lat względem
          ustawowego wieku emerytalnego, należysz do 3,7% społeczeństwa w
          przypadku mężczyzn 8,5% w przypadku kobiet? (dane z r.2024). Względem
          roku 2022 odnotowano w tej grupie spadek o kolejno: 0,1% dla mężczyzn
          o 0,3% dla kobiet.
        </span>
      </div>
      <div className="shadow-lg mx-auto mt-10 max-w-4xl text-xl alert alert-info">
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
