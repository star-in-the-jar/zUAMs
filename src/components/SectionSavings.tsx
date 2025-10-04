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
    <div className="bg-white text-base-content card">
      <div className="p-4 card-body">
        <h3 className="mb-4 text-primary text-lg card-title">Oszczędności</h3>
        <div className="flex flex-col gap-y-4">
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">
                Zebrane świadczenia ZUS
              </span>
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
              <span className="label-text-alt text-base-content/60">
                Suma już zebranych świadczeń w ZUS
              </span>
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">
                Dodatkowe oszczędności
              </span>
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
              <span className="label-text-alt text-base-content/60">
                Dodatkowe oszczędności emerytalne w ramach II i III filaru, np.
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
