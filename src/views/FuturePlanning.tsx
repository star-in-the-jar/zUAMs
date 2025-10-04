import type React from "react";
import { useState, ChangeEvent } from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import { calculatePension } from "@/core/calculatePension";
import { GENDERS } from "@/const/genders";

import {
  ClockIcon,
  CurrencyDollarIcon,
  PresentationChartLineIcon,
  HomeIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

interface Scenario {
  years: number;
  label: string;
  retirementIncrease: number;
  bondSavings: number;
  bondIncrease: number;
}

const scenarios: Scenario[] = [
  {
    years: 2,
    label: "Wariant 2 Lata",
    retirementIncrease: 700,
    bondSavings: 200,
    bondIncrease: 700,
  },
  {
    years: 5,
    label: "Wariant 5 Lat",
    retirementIncrease: 1500,
    bondSavings: 500,
    bondIncrease: 1800,
  },
  {
    years: 10,
    label: "Wariant 10 Lat",
    retirementIncrease: 3000,
    bondSavings: 1000,
    bondIncrease: 3500,
  },
];

const PlanningFuture: React.FC = () => {
  const snap = useSnapshot(appState);

  // Stan dla oczekiwanej emerytury (początkowo np. 6500 zł)
  const [expectedPension, setExpectedPension] = useState<number>(6500);

  const currentPension = calculatePension({
    age: snap.age,
    retirementAge: snap.retirementAge,
    gender: snap.gender ?? GENDERS.MALE,
  });

  const baseRetirementYear = getRetirementYear(snap.age, snap.retirementAge);

  function getRetirementYear(age: number, retirementAge: number) {
    const currentYear = new Date().getFullYear();
    const yearsToRetirement = retirementAge - age;
    return currentYear + yearsToRetirement;
  }

  // Funkcja dynamicznie obliczająca kolor na podstawie oczekiwań
  // Zastosowano Math.round(), aby zapewnić poprawną równość (==)
  const getColorClass = (value: number) => {
    const roundedValue = Math.round(value);
    const roundedExpected = Math.round(expectedPension);

    if (roundedValue > roundedExpected) return "text-success"; // Zielony
    if (roundedValue < roundedExpected) return "text-error"; // Czerwony

    // Jeśli równe, używamy domyślnego koloru treści (czarny/ciemny)
    return "text-base-content";
  };

  const getFinalPension = (scenario: Scenario) => {
    return currentPension + scenario.retirementIncrease + scenario.bondIncrease;
  };

  const handleExpectedPensionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = Number(e.target.value);
    if (!isNaN(num) && num >= 0) {
      setExpectedPension(num);
    }
  };

  const ScenarioColumn: React.FC<{ scenario: Scenario }> = ({ scenario }) => {
    // 1. PO ZUS: Bazowa + Zysk z ZUS
    const pensionAfterZus = currentPension + scenario.retirementIncrease;

    // 2. PO OSZCZĘDNOŚCIACH (sam zysk z obligacji)
    const pensionAfterBondsOnly = currentPension + scenario.bondIncrease;

    // 3. ŁĄCZNIE: ZUS + Obligacje
    const finalPension = getFinalPension(scenario);

    const finalRetirementYear = getRetirementYear(
      snap.age,
      snap.retirementAge + scenario.years
    );

    // Dynamiczne kolory
    const colorAfterZus = getColorClass(pensionAfterZus);
    const colorAfterBondsOnly = getColorClass(pensionAfterBondsOnly);
    const colorFinal = getColorClass(finalPension);

    return (
      <div className="card w-full bg-base-100 shadow-xl border border-primary/20 transition-transform duration-300 hover:scale-[1.03]">
        <div className="card-body p-5">
          <h2 className="card-title text-2xl justify-center text-primary mb-3 border-b-2 border-primary/50 pb-2">
            <PresentationChartLineIcon className="w-6 h-6 mr-2" />
            {scenario.label}
          </h2>

          {/* Dłuższa Praca (ZUS) */}
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
                +{scenario.retirementIncrease} zł
              </div>
            </div>

            {/* Kwota po dodaniu zysku z ZUS */}
            <div className="stat place-items-center p-3 border-t border-primary/20">
              <div className="stat-title text-base-content">PO ZYSKU ZUS:</div>
              <div className={`stat-value text-3xl font-bold ${colorAfterZus}`}>
                {Math.round(pensionAfterZus)} zł
              </div>
            </div>
          </div>

          {/* Odkładanie w Obligacjach */}
          <div className="stats stats-vertical shadow bg-base-200">
            <div className="stat place-items-center p-3">
              <div className="stat-title flex items-center text-info">
                <CurrencyDollarIcon className="w-5 h-5 mr-1" />
                Miesięczne oszczędności
              </div>
              <div className="stat-value text-accent">
                {scenario.bondSavings} zł
              </div>
            </div>

            <div className="stat place-items-center p-3 border-t border-gray-300">
              <div className="stat-title text-info">Szacowany zysk (mc)</div>
              <div className="stat-value text-success text-2xl">
                +{scenario.bondIncrease} zł
              </div>
            </div>

            {/* Kwota po dodaniu samego zysku z OSZCZĘDNOŚCI (ignorując ZUS) */}
            <div className="stat place-items-center p-3 border-t border-primary/20">
              <div className="stat-title text-base-content">
                PO ZYSKU Z OSZCZĘDNOŚCI:
              </div>
              <div
                className={`stat-value text-3xl font-bold ${colorAfterBondsOnly}`}
              >
                {Math.round(pensionAfterBondsOnly)} zł
              </div>
            </div>
          </div>
        </div>

        {/* PODSUMOWANIE (Stopka karty) - Używa koloru łącznej kwoty */}
        <div className="card-actions justify-center p-4 bg-base-300">
          <h3 className="text-xl font-bold text-base-content/80">
            ŁĄCZNIE MIESIĘCZNIE:
          </h3>
          <p
            className={`text-4xl font-extrabold flex items-center ${colorFinal}`}
          >
            {Math.round(finalPension)} zł
          </p>
        </div>
      </div>
    );
  };

  const colorCurrent = getColorClass(currentPension);

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary border-b-4 border-primary/50 pb-3">
        Planowanie Twojej emerytury
      </h1>

      <div className="text-center mb-10 card p-6 bg-base-100 shadow-lg max-w-lg mx-auto">
        <h2 className="text-xl font-semibold mb-3 text-info flex items-center justify-center">
          <HomeIcon className="w-6 h-6 mr-2" />
          Moje Oczekiwania na Starość
        </h2>
        <div className="form-control w-full max-w-xs mx-auto">
          <label className="input-group input-group-lg">
            <span className="bg-primary text-primary-content font-bold">
              Oczekuję:
            </span>
            <input
              type="number"
              value={expectedPension}
              onChange={handleExpectedPensionChange}
              placeholder="Wpisz kwotę..."
              className="input input-bordered input-lg w-full text-2xl font-bold text-base-content"
            />
            <span className="bg-primary text-primary-content font-bold">
              zł/mc
            </span>
          </label>
        </div>
        <p className="text-sm text-base-content/70 mt-3">
          Aktualna oczekiwana kwota:{" "}
          <span className="font-bold">{expectedPension} zł/mc</span>
        </p>
      </div>

      <div className="text-center mb-10">
        <div className="badge badge-lg badge-info p-3 text-lg font-semibold">
          Twoja obecna estymacja bazowa
        </div>
        <div
          className={`text-6xl font-extrabold mt-2 bg-base-300 p-4 inline-block rounded-box shadow-inner ${colorCurrent}`}
        >
          {Math.round(currentPension)} zł/mc
        </div>
        <p className="text-base-content/70 mt-1">
          Przejście na emeryturę w {snap.retirementAge} roku życia (
          {baseRetirementYear} r.)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <ScenarioColumn key={scenario.years} scenario={scenario} />
        ))}
      </div>

      <div className="alert alert-warning mt-10 shadow-lg max-w-4xl mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>
          Uwaga: Powyższe kwoty są orientacyjne i służą wyłącznie celom
          demonstracyjnym. Dokładne wyliczenia wymagają uwzględnienia inflacji,
          stopy zwrotu obligacji i indywidualnego stażu pracy.
        </span>
      </div>
    </div>
  );
};

export default PlanningFuture;
