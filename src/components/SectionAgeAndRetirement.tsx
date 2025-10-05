import React from "react";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import GenderButtons from "@/components/GenderButtons";
import { MIN_AGE, MAX_AGE } from "@/const/age";

const handlePensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num)) {
    appState.pension = num;
  }
};

const SectionAgeAndRetirement: React.FC = () => {
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = Number(val);
    if (!isNaN(num) && num > MIN_AGE && num < MAX_AGE) {
      setAndMarkAsChanged("age", num);
      setAndMarkAsChanged("retirementAge", Math.max(snap.retirementAge, num));
    }
  };

  const snap = useSnapshot(appState);
  return (
    <div className="bg-white text-base-content card">
      <div className="card-body">
        <div className="flex flex-col gap-y-4">
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">
                Jaką emeryturę miesięczną chciałbyś mieć?
              </span>
            </label>
            <div className="input w-full">
              <input
                value={snap.pension}
                className="grow"
                type="number"
                onChange={handlePensionChange}
              />
              zł
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">Jesteś</span>
            </label>
            <GenderButtons />
            <div className="label">
              <span className="label-text-alt">
                Mężczyźni mogą prześć na emeryturę w wieku 65 lat, kobiety w
                wieku 60 lat
              </span>
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">
                W jakim wieku jesteś?
              </span>
            </label>
            <div className="input w-full">
              <input
                value={snap.age}
                className="grow"
                type="number"
                onChange={handleAgeChange}
              />
              lat
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionAgeAndRetirement;
