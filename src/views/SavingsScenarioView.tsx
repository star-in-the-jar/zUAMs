import React, { useState, ChangeEvent } from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import { calculatePension } from "@/core/calculatePension";
import { GENDERS } from "@/const/genders";
import {
  CurrencyDollarIcon,
  TrophyIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface Scenario {
  years: number;
  label: string;
}

const scenarios: Scenario[] = [
  { years: 5, label: "5 lat" },
  { years: 10, label: "10 lat" },
  { years: 0, label: "Do emerytury" },
];

const ANNUAL_RETURN_RATE = 0.05;
const RETIREMENT_AGE = { MALE: 65, FEMALE: 60 };
const AVERAGE_LIFE_EXPECTANCY = { MALE: 75, FEMALE: 82 };

const SavingsScenarioView: React.FC = () => {
  const snap = useSnapshot(appState);
  const [baseMonthlySavings, setBaseMonthlySavings] = useState<number>(800);
  const isMale = snap.gender === GENDERS.MALE || snap.gender === undefined;

  const statutoryRetirementAge = isMale
    ? RETIREMENT_AGE.MALE
    : RETIREMENT_AGE.FEMALE;
  const lifeExpectancy = isMale
    ? AVERAGE_LIFE_EXPECTANCY.MALE
    : AVERAGE_LIFE_EXPECTANCY.FEMALE;

  const currentPension = calculatePension(snap);

  const getInvestmentYears = (scenarioYears: number): number => {
    if (scenarioYears > 0) return scenarioYears;
    return Math.max(0, statutoryRetirementAge - snap.age);
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
      retirementYears,
      retirementMonths,
    };
  };

  const handleSavingsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    setBaseMonthlySavings(isNaN(num) || num < 0 ? 0 : num);
  };

  const ScenarioCard: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
    const years = getInvestmentYears(scenario.years);
    const { totalSaved, monthlyGain, retirementYears, retirementMonths } =
      getInvestmentResults(years, baseMonthlySavings);

    const labelText =
      scenario.years === 0
        ? `Inwestujesz do ${statutoryRetirementAge} r.ż. (${years} lat)`
        : `Inwestujesz przez ${years} lat`;

    return (
      <div className="bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-center gap-2 text-primary font-bold text-xl">
          <TrophyIcon className="w-6 h-6" />
          {scenario.label}
        </div>

        <div className="text-center mb-3">
          <p className="text-xs text-gray-400">{labelText}</p>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Sumarycznie oszczędziłeś</p>
          <p className="text-xl text-amber-600 font-bold">
            {totalSaved.toLocaleString("pl-PL")} zł
          </p>
          <p className="text-xs text-gray-400 mt-1">
            w ciągu {years * 12} miesięcy
          </p>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Szacowany zysk (mc)</p>
          <p className="text-xl text-success font-bold">
            +{monthlyGain.toLocaleString("pl-PL")} zł
          </p>
          <p className="text-xs text-gray-400 mt-1">
            na {retirementMonths} miesięcy (zakładamy, że emerytura trwa{" "}
            {retirementYears} lat)
          </p>
        </div>

        <div className="text-center border-t border-gray-100 pt-2">
          <p className="text-sm text-gray-600 font-medium">
            Łącznie miesięcznie
          </p>
          <p className="text-4xl font-extrabold text-primary">
            {Math.round(currentPension + monthlyGain).toLocaleString("pl-PL")}{" "}
            zł
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white text-base-content rounded-2xl p-4 shadow-md">
      <h1 className="mb-8 pb-3 border-primary/50 border-b-4 font-bold text-primary text-4xl text-center">
        Własne Oszczędności
      </h1>

      <p className="mb-6 text-gray-600 text-lg text-center">
        Bazowa emerytura:{" "}
        <span className="font-bold text-primary">
          {Math.round(snap.pension)} zł/mc
        </span>{" "}
      </p>

      <div className="flex justify-center mb-8">
        <label className="flex items-center gap-2 input">
          <CurrencyDollarIcon className="w-6 h-6 text-primary" />
          <span className="text-base font-semibold text-gray-600">
            Miesięcznie
          </span>
          <input
            type="number"
            value={baseMonthlySavings}
            onChange={handleSavingsChange}
            className="w-24 text-center font-bold text-primary text-lg bg-transparent outline-none flex-grow"
          />
          <span className="text-gray-500 font-semibold ml-auto">zł</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {scenarios.map((scenario) => (
          <ScenarioCard key={scenario.years} scenario={scenario} />
        ))}
      </div>

      <div className="mt-10 space-y-4 max-w-4xl mx-auto">
        <div className="alert alert-info flex items-start gap-3 p-4 rounded-xl shadow-sm">
          <InformationCircleIcon className="min-w-6 w-6 h-6" />
          <p className="text-sm leading-relaxed">
            Warto jednak zaznaczyć, że w przeciągu dwóch lat (2022-2024)
            odnotowano spadek osób przechodzących na emeryturę równo w wieku
            emerytalnym (o 3,9% w przypadku mężczyzn i 2,4% w przypadku kobiet).
            Oznacza to, że coraz więcej osób przechodzi na emeryturę później w
            celu uzyskania wyższych składek emerytalnych.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavingsScenarioView;
