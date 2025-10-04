import type React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import GenderButtons from "@/components/GenderButtons";
import { calculatePension } from "@/core/calculatePension";
import { GENDERS } from "@/const/genders";
import { MIN_AGE, MAX_AGE } from "@/const/age";

const getListItemClassNames = () => {
  return "flex flex-row gap-x-2 items-center";
};

const getRetirementYear = (age: number, retirementAge: number) => {
  const currentYear = new Date().getFullYear();
  const yearsToRetirement = retirementAge - age;
  return currentYear + yearsToRetirement;
};

const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num > MIN_AGE && num < MAX_AGE) {
    appState.age = num;
    appState.retirementAge = Math.max(appState.retirementAge, num);
  }
};

const handleRetirementAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num > MIN_AGE && num < MAX_AGE) {
    appState.retirementAge = num;
    appState.age = Math.min(appState.age, num);
  }
};

const Result: React.FC = () => {
  const snap = useSnapshot(appState);

  return (
    <>
      <h1 className="text-4xl font-semibold mb-6 text-primary">
        Zakładając, że
      </h1>

      <form className="mb-6">
        <ol className="flex flex-col gap-y-4">
          <li className={getListItemClassNames()}>
            Jesteś <GenderButtons />
          </li>
          <li className={getListItemClassNames()}>
            Masz obecnie
            <input
              value={snap.age}
              className="input max-w-16"
              type="number"
              onChange={handleAgeChange}
            />
            lat
          </li>
          <li className={getListItemClassNames()}>
            Przejdziesz na emeryturę w wieku
            <input
              value={snap.retirementAge}
              className="input max-w-16"
              type="number"
              onChange={handleRetirementAgeChange}
            />
            ({getRetirementYear(snap.age, snap.retirementAge)}
            r.)
          </li>
        </ol>
      </form>
      <h2 className="text-2xl">
        Otrzymasz emeryturę w wysokości{" "}
        <span className="text-primary font-bold">
          {calculatePension({
            age: snap.age,
            retirementAge: snap.retirementAge,
            gender: snap.gender ?? GENDERS.MALE,
          })}
        </span>{" "}
        PLN netto
      </h2>
    </>
  );
};

export default Result;
