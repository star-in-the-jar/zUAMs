import React from "react";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import UnchangedField from "./UnchangedField";

const handleCollectedZusBenefitsChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    setAndMarkAsChanged("collectedZusBenefits", num);
  }
};

const handleAdditionalSavingsChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    setAndMarkAsChanged("additionalSavings", num);
  }
};

const SectionSavings: React.FC = () => {
  const snap = useSnapshot(appState);
  return (
    <div className="bg-white text-base-content card">
      <div className="p-4 card-body">
        <h3 className="text-lg card-title text-primary">Oszczędności</h3>
        <div className="flex flex-col gap-y-4">
          <UnchangedField field="collectedZusBenefits">
            <div className="w-full flex flex-col gap-y-1">
              <label>
                <span className="font-medium label-text">
                  Zebrane świadczenia ZUS
                </span>
                <div className="input w-full">
                  <input
                    value={snap.collectedZusBenefits}
                    className="grow"
                    type="number"
                    min="0"
                    onChange={handleCollectedZusBenefitsChange}
                  />
                  zł
                </div>
              </label>
            </div>
          </UnchangedField>

          <UnchangedField field="additionalSavings">
            <div className="w-full flex flex-col gap-y-1">
              <label>
                <span className="font-medium label-text">
                  Dodatkowe oszczędności
                </span>
                <div className="input w-full">
                  <input
                    value={snap.additionalSavings}
                    className="grow"
                    type="number"
                    min="0"
                    onChange={handleAdditionalSavingsChange}
                  />
                  zł
                </div>
              </label>

              <div className="label">
                <span className="label-text-alt">
                  Dodatkowe oszczędności odłożone w ramach II i III filaru, np.
                  IKE, IKZE
                </span>
              </div>
            </div>
          </UnchangedField>
        </div>
      </div>
    </div>
  );
};

export default SectionSavings;
