import React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import GenderButtons from "@/components/GenderButtons";
import { MIN_AGE, MAX_AGE } from "@/const/age";

const handlePensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num)) {
    appState.pension = num;
  }
};

const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num > MIN_AGE && num < MAX_AGE) {
    appState.age = num;
    appState.retirementAge = Math.max(appState.retirementAge, num);
  }
};

const SectionAgeAndRetirement: React.FC = () => {
  const snap = useSnapshot(appState);
  return (
    <div className="bg-white text-base-content card">
      <div className="card-body">
        <h3 className="mb-4 text-primary text-lg card-title">
          Wiek i emerytura
        </h3>
        <div className="flex flex-col gap-y-4">
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">
                Jaką emeryturę chciałbyś mieć?
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                value={snap.pension}
                className="input-bordered w-20 input"
                type="number"
                onChange={handlePensionChange}
              />
              <span className="text-sm">zł/mc</span>
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">Kim jesteś?</span>
            </label>
            <GenderButtons />
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Mężczyźni mogą prześć na emeryturę w wieku 65 lat, kobiety w wieku 60 lat
              </span>
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">W jakim wieku jesteś?</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionAgeAndRetirement;
