import React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";

const handleMaternityLeavesChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    appState.maternityLeaves = num;
  }
};

const handleAverageSickDaysChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  appState.averageSickDays = e.target.checked;
};

const SectionLeavesAndBreaks: React.FC = () => {
  const snap = useSnapshot(appState);
  return (
    <div className="bg-white text-base-content card">
      <div className="p-4 card-body">
        <h3 className="mb-4 text-primary text-lg card-title">
          Urlopy i przerwy
        </h3>
        <div className="flex flex-col gap-y-4">
          <div className="form-control">
            <label className="label">
              <span className="font-medium label-text">
                Urlopy macierzyńskie
              </span>
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
              <span className="label-text-alt text-base-content/60">
                Liczba planowanych urlopów macierzyńskich w trakcie kariery
                zawodowej
              </span>
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
              <span className="text-sm">
                Zamierzasz brać tyle urlopów zdrowotnych co przeciętny Polak (34
                dni rocznie)
              </span>
            </div>
            <div className="label">
              <span className="label-text-alt text-base-content/60">
                Średnia liczba dni chorobowych w Polsce to około 34 dni rocznie
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionLeavesAndBreaks;
