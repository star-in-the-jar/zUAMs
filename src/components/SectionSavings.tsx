import React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";

const handleCollectedZusBenefitsChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    appState.collectedZusBenefits = num;
  }
};

const handleAdditionalSavingsChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    appState.additionalSavings = num;
  }
};

const SectionSavings: React.FC = () => {
  const snap = useSnapshot(appState);
  return (
    <div className="bg-white card text-base-content">
      <div className="p-4 card-body">
        <h3 className="mb-4 text-lg card-title text-primary">Oszczędności</h3>
        <div className="flex flex-col gap-y-4">
          <div className="flex flex-col gap-y-1">
            <label className="label">
              <span className="font-medium label-text">
                Zebrane świadczenia ZUS
              </span>
            </label>
            <div className="input w-full">
              <input
                value={snap.collectedZusBenefits}
                className="grow"
                type="number"
                min="0"
                onChange={handleCollectedZusBenefitsChange}
              />
              PLN
            </div>
          </div>
          <div className="flex flex-col gap-y-1">
            <label className="label">
              <span className="font-medium label-text">
                Dodatkowe oszczędności
              </span>
            </label>
            <div className="input w-full">
              <input
                value={snap.additionalSavings}
                className="grow"
                type="number"
                min="0"
                onChange={handleAdditionalSavingsChange}
              />
              PLN
            </div>
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Oszczędności odłożone dodatkowo w ramach II i III filaru, np.
                IKE, IKZE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionSavings;
