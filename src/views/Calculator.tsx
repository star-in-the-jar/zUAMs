import type React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import GenderButtons from "@/components/GenderButtons";
import { calculatePension } from "@/core/calculatePension";
import { GENDERS } from "@/const/genders";
import { MIN_AGE, MAX_AGE } from "@/const/age";

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

const handleMaternityLeavesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    appState.maternityLeaves = num;
  }
};

const handleMonthlyGrossSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    appState.monthlyGrossSalary = num;
  }
};

const handleEmploymentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  appState.employmentType = e.target.value as 'UoP' | 'JDG';
};

const handleAverageSickDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  appState.averageSickDays = e.target.checked;
};

const handleAdditionalSavingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    appState.additionalSavings = num;
  }
};

const handleCurrentMonthlySalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    appState.currentMonthlySalary = num;
  }
};

const handleCollectedZusBenefitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    appState.collectedZusBenefits = num;
  }
};

const Result: React.FC = () => {
  const snap = useSnapshot(appState);

  return (
    <>
      <h1 className="mb-6 font-semibold text-primary text-4xl">
        Zakładając, że
      </h1>

      <form className="mb-6">
        <div className="flex flex-col gap-y-6 w-full max-w-2xl">

          {/* 1️⃣ Wiek i emerytura */}
          <div className="bg-base-100 shadow-sm border border-base-300 card">
            <div className="p-4 card-body">
              <h3 className="mb-4 text-lg card-title">1️⃣ Wiek i emerytura</h3>
              <div className="flex flex-col gap-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="font-medium label-text">Płeć</span>
                  </label>
                  <GenderButtons />
                  <div className="label">
                    <span className="label-text-alt text-base-content/60">Wpływa na wiek emerytalny</span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="font-medium label-text">Obecny wiek</span>
                  </label>
                  <div className="flex items-center gap-2">
              <input
                value={snap.age}
                      className="input-bordered w-20 input"
                type="number"
                      min={MIN_AGE}
                      max={MAX_AGE}
                onChange={handleAgeChange}
              />
                    <span className="text-sm">lat</span>
                  </div>
                  <div className="label">
                    <span className="label-text-alt text-base-content/60">Twój aktualny wiek</span>
                  </div>
            </div>

                <div className="form-control">
                  <label className="label">
                    <span className="font-medium label-text">Wiek emerytalny</span>
                  </label>
                  <div className="flex items-center gap-2">
            <input
              value={snap.retirementAge}
                      className="input-bordered w-20 input"
              type="number"
                      min={MIN_AGE}
                      max={MAX_AGE}
              onChange={handleRetirementAgeChange}
            />
                    <span className="text-sm">lat</span>
                    <span className="text-sm text-base-content/60">
                      ({getRetirementYear(snap.age, snap.retirementAge)} r.)
                    </span>
                  </div>
                  <div className="label">
                    <span className="label-text-alt text-base-content/60">Kiedy planujesz przejść na emeryturę</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Options Accordion */}
          <div className="collapse collapse-arrow bg-base-200">
            <input type="checkbox" className="collapse-toggle" />
            <div className="collapse-title font-medium text-xl">
              Więcej opcji
            </div>
            <div className="collapse-content">
              <div className="flex flex-col gap-y-6 pt-4">

                {/* 2️⃣ Praca i zarobki */}
                <div className="bg-base-100 shadow-sm border border-base-300 card">
                  <div className="p-4 card-body">
                    <h3 className="mb-4 text-lg card-title">2️⃣ Praca i zarobki</h3>
                    <div className="flex flex-col gap-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium label-text">Typ zatrudnienia</span>
                        </label>
                        <div className="join">
                          <input
                            className="join-item btn"
                            type="radio"
                            name="employmentType"
                            value="UoP"
                            checked={snap.employmentType === 'UoP'}
                            onChange={handleEmploymentTypeChange}
                            aria-label="UoP"
                          />
                          <input
                            className="join-item btn"
                            type="radio"
                            name="employmentType"
                            value="JDG"
                            checked={snap.employmentType === 'JDG'}
                            onChange={handleEmploymentTypeChange}
                            aria-label="JDG"
                          />
                        </div>
                        <div className="label">
                          <span className="label-text-alt text-base-content/60">Umowa o pracę (UoP) lub Jednoosobowa działalność gospodarcza (JDG)</span>
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium label-text">Aktualne wynagrodzenie netto</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            value={snap.currentMonthlySalary}
                            className="input-bordered w-32 input"
                            type="number"
                            min="0"
                            onChange={handleCurrentMonthlySalaryChange}
                          />
                          <span className="text-sm">zł miesięcznie</span>
                        </div>
                        <div className="label">
                          <span className="label-text-alt text-base-content/60">Twoje aktualne miesięczne wynagrodzenie netto</span>
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium label-text">Wynagrodzenie brutto</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            value={snap.monthlyGrossSalary}
                            className="input-bordered w-32 input"
                            type="number"
                            min="0"
                            onChange={handleMonthlyGrossSalaryChange}
                          />
                          <span className="text-sm">PLN brutto miesięcznie</span>
                        </div>
                        <div className="label">
                          <span className="label-text-alt text-base-content/60">Twoje miesięczne wynagrodzenie brutto</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3️⃣ Urlopy i przerwy */}
                <div className="bg-base-100 shadow-sm border border-base-300 card">
                  <div className="p-4 card-body">
                    <h3 className="mb-4 text-lg card-title">3️⃣ Urlopy i przerwy</h3>
                    <div className="flex flex-col gap-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium label-text">Urlopy macierzyńskie</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Weźmiesz</span>
                          <input
                            value={snap.maternityLeaves}
                            className="input-bordered w-20 input"
                            type="number"
                            min="0"
                            onChange={handleMaternityLeavesChange}
                          />
                          <span className="text-sm">urlopów macierzyńskich</span>
                        </div>
                        <div className="label">
                          <span className="label-text-alt text-base-content/60">Liczba planowanych urlopów macierzyńskich w trakcie kariery zawodowej</span>
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium label-text">Urlopy zdrowotne</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={snap.averageSickDays}
                            onChange={handleAverageSickDaysChange}
                          />
                          <span className="text-sm">Zamierzasz brać tyle urlopów zdrowotnych co przeciętny Polak (34 dni rocznie)</span>
                        </div>
                        <div className="label">
                          <span className="label-text-alt text-base-content/60">Średnia liczba dni chorobowych w Polsce to około 34 dni rocznie</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4️⃣ Oszczędności */}
                <div className="bg-base-100 shadow-sm border border-base-300 card">
                  <div className="p-4 card-body">
                    <h3 className="mb-4 text-lg card-title">4️⃣ Oszczędności</h3>
                    <div className="flex flex-col gap-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium label-text">Zebrane świadczenia ZUS</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            value={snap.collectedZusBenefits}
                            className="input-bordered w-32 input"
                            type="number"
                            min="0"
                            onChange={handleCollectedZusBenefitsChange}
                          />
                          <span className="text-sm">zł</span>
                        </div>
                        <div className="label">
                          <span className="label-text-alt text-base-content/60">Suma już zebranych świadczeń w ZUS</span>
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="font-medium label-text">Dodatkowe oszczędności</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Odkładasz dodatkowo</span>
                          <input
                            value={snap.additionalSavings}
                            className="input-bordered w-32 input"
                            type="number"
                            min="0"
                            onChange={handleAdditionalSavingsChange}
                          />
                          <span className="text-sm">zł w II i III filarze (np. IKE)</span>
                        </div>
                        <div className="label">
                          <span className="label-text-alt text-base-content/60">Dodatkowe oszczędności emerytalne w ramach II i III filaru, np. IKE, IKZE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <h2 className="text-2xl">
        Otrzymasz emeryturę w wysokości{" "}
        <span className="font-bold text-primary">
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
