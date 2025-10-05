import React, { useState, ChangeEvent } from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import { calculatePension } from "@/core/calculatePension";
import { GENDERS } from "@/const/genders";

import {
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  TrophyIcon,
  ClockIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";

interface Scenario {
  years: number;
  label: string;
}

const scenarios: Scenario[] = [
  { years: 5, label: "5 Lat" },
  { years: 10, label: "10 Lat" },
  { years: 0, label: "Do Emerytury" },
];

const ANNUAL_RETURN_RATE = 0.05;
const RETIREMENT_AGE = { MALE: 65, FEMALE: 60 };
const AVERAGE_LIFE_EXPECTANCY = { MALE: 75, FEMALE: 82 };

const SavingsScenarioView: React.FC = () => {
  const snap = useSnapshot(appState);
  const [baseMonthlySavings, setBaseMonthlySavings] = useState<number>(800);
  const EXPECTED_PENSION = 6500;

  const isMale = snap.gender === GENDERS.MALE || snap.gender === undefined;

  const statutoryRetirementAge = isMale
    ? RETIREMENT_AGE.MALE
    : RETIREMENT_AGE.FEMALE;
  const lifeExpectancy = isMale
    ? AVERAGE_LIFE_EXPECTANCY.MALE
    : AVERAGE_LIFE_EXPECTANCY.FEMALE;

  const currentPension = calculatePension({
    age: snap.age,
    retirementAge: snap.retirementAge,
    gender: snap.gender ?? GENDERS.MALE,
  });

  const getInvestmentYears = (scenarioYears: number): number => {
    if (scenarioYears > 0) return scenarioYears;
    return Math.max(0, statutoryRetirementAge - snap.age);
  };

  const getColorClass = (value: number) => {
    const roundedValue = Math.round(value);
    if (roundedValue >= EXPECTED_PENSION) return "text-success";
    if (roundedValue < EXPECTED_PENSION) return "text-error";
    return "text-base-content";
  };

  const getInvestmentResults = (years: number, monthlySavings: number) => {
    const investmentMonths = years * 12;
    const retirementYears = Math.max(
      1,
      lifeExpectancy - statutoryRetirementAge
    );
    const retirementMonths = retirementYears * 12;
    const totalSaved = monthlySavings * investmentMonths;
    const compoundFactor = Math.pow(1 + ANNUAL_RETURN_RATE, years);
    const totalCapital = totalSaved * compoundFactor;
    const monthlyPensionGain =
      retirementMonths > 0 ? totalCapital / retirementMonths : 0;

    return {
      totalSaved: Math.round(totalSaved),
      monthlyGain: Math.round(monthlyPensionGain),
      investmentMonths,
      retirementMonths,
      retirementYears,
    };
  };

  const handleSavingsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setBaseMonthlySavings(isNaN(num) || num < 0 ? 0 : num);
  };

  const ScenarioColumn: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
    const years = getInvestmentYears(scenario.years);
    const {
      totalSaved,
      monthlyGain,
      investmentMonths,
      retirementMonths,
      retirementYears,
    } = getInvestmentResults(years, baseMonthlySavings);

    const pensionAfterSavings = currentPension + monthlyGain;
    const colorAfterSavings = getColorClass(pensionAfterSavings);

    const labelText =
      scenario.years === 0
        ? `Inwestujesz do ${statutoryRetirementAge} r.ż. (${years} lat)`
        : `Inwestujesz przez ${years} lat`;

    return (
      <div className="card w-full bg-base-100 shadow-xl border border-primary/20">
        <div className="card-body p-5">
          <h2 className="card-title text-2xl justify-center text-primary mb-3 border-b-2 border-primary/50 pb-2">
            <TrophyIcon className="w-6 h-6 mr-2" />
            {scenario.label}
          </h2>

          <div className="stats stats-vertical shadow bg-base-200 mb-4">
            <div className="stat place-items-center p-3">
              <div className="stat-title flex items-center text-info">
                <ClockIcon className="w-5 h-5 mr-1" />
                Okres Inwestowania
              </div>
              <div className="stat-value text-base-content text-3xl">
                {years} lat
              </div>
              <div className="stat-desc text-sm mt-1">{labelText}</div>
            </div>
          </div>

          <div className="stats stats-vertical shadow bg-base-200">
            <div className="stat place-items-center p-3">
              <div className="stat-title text-info flex items-center">
                <CalculatorIcon className="w-5 h-5 mr-1" />
                Sumarycznie Oszczędziłeś
              </div>
              <div className="stat-value text-accent text-2xl">
                {totalSaved.toLocaleString("pl-PL")} zł
              </div>
              <div className="stat-desc text-sm mt-1">
                w ciągu {investmentMonths} miesięcy
              </div>
            </div>

            <div className="stat place-items-center p-3 border-t border-gray-300">
              <div className="stat-title text-info">Szacowany Zysk (mc)</div>
              <div className="stat-value text-success text-3xl">
                +{monthlyGain} zł
              </div>
              <div className="stat-desc text-sm">
                na {retirementMonths} miesięcy (zakładamy, że emerytura trwa{" "}
                {retirementYears} lat)
              </div>
            </div>

            <div className="stat place-items-center p-3 border-t border-primary/20 bg-base-300">
              <div className="stat-title text-base-content font-bold text-lg">
                ŁĄCZNIE MIESIĘCZNIE:
              </div>
              <div
                className={`stat-value text-4xl font-extrabold ${colorAfterSavings}`}
              >
                {Math.round(pensionAfterSavings)} zł
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
        Własne Oszczędności
      </h1>

      <p className="text-center text-xl text-base-content/70 mb-8">
        Bazowa emerytura:{" "}
        <span className="font-bold">{Math.round(snap.pension)} zł/mc</span>
        <span className="ml-4 text-sm">
          (Płeć: {isMale ? "Mężczyzna, 65 lat" : "Kobieta, 60 lat"})
        </span>
      </p>

      <div className="text-center mb-10 card p-6 bg-base-100 shadow-lg max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-3 text-info flex items-center justify-center">
          <CurrencyDollarIcon className="w-6 h-6 mr-2" />
          Kwota Miesięcznych Oszczędności
        </h2>
        <div className="form-control w-full max-w-xs mx-auto">
          <label className="input-group input-group-lg">
            <span className="bg-primary text-primary-content font-bold">
              Miesięcznie:
            </span>
            <input
              type="number"
              value={baseMonthlySavings}
              onChange={handleSavingsChange}
              placeholder="Wpisz kwotę..."
              className="input input-bordered input-lg w-full text-2xl font-bold text-base-content"
            />
            <span className="bg-primary text-primary-content font-bold">
              zł
            </span>
          </label>
        </div>
        <p className="text-sm text-base-content/70 mt-3">
          Kwota ta jest używana do symulacji we wszystkich wariantach poniżej.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {scenarios.map((scenario) => (
          <ScenarioColumn key={scenario.years} scenario={scenario} />
        ))}
      </div>

      <div className="alert alert-info mt-10 shadow-lg w-fit mx-auto">
        <PresentationChartLineIcon className="w-6 h-6 shrink-0" />
        <span className="text-center">
          Symulacja uwzględnia średnią długość życia (
          <span className="font-bold">
            M: {AVERAGE_LIFE_EXPECTANCY.MALE} lat, K:{" "}
            {AVERAGE_LIFE_EXPECTANCY.FEMALE} lat
          </span>
          ) oraz uproszczony{" "}
          <span className="font-bold">
            {ANNUAL_RETURN_RATE * 100}% roczny zysk
          </span>{" "}
          z inwestycji.
        </span>
      </div>
    </div>
  );
};

export default SavingsScenarioView;
