import React from "react";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import UnchangedField from "./UnchangedField";

const handleMaternityLeavesChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const val = e.target.value;
  const num = Number(val);
  if (!isNaN(num) && num >= 0) {
    setAndMarkAsChanged("maternityLeaves", num);
  }
};

const handleAverageSickDaysChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setAndMarkAsChanged("averageSickDays", e.target.checked);
};

const SectionLeavesAndBreaks: React.FC = () => {
  const snap = useSnapshot(appState);
  return (
    <div className="bg-white text-base-content card">
      <div className="p-4 card-body">
        <h3 className="text-lg card-title text-primary">Urlopy i przerwy</h3>
        <div className="flex flex-col gap-y-4">
          <UnchangedField field="maternityLeaves">
            <div className="form-control">
              <label>
                <span className="font-medium label-text">
                  Liczba urlopów macierzyńskich
                </span>
                <input
                  value={snap.maternityLeaves}
                  className="input-bordered w-full input"
                  type="number"
                  min="0"
                  onChange={handleMaternityLeavesChange}
                />
              </label>
              <div className="label">
                <span className="label-text-alt">
                  Liczba planowanych urlopów macierzyńskich w trakcie kariery
                  zawodowej
                </span>
              </div>
            </div>
          </UnchangedField>
          <UnchangedField field="averageSickDays">
            <div className="form-control">
              <label className="label flex items-center gap-2">
                <input
                  type="checkbox"
                  className="toggle toggle-primary peer checked:bg-primary/15"
                  checked={snap.averageSickDays}
                  onChange={handleAverageSickDaysChange}
                />
                <span className="peer-checked:text-primary font-medium">
                  Chcę brać tyle urlopów zdrowotnych co przeciętny Polak (34 dni
                  rocznie)
                </span>
              </label>
            </div>
          </UnchangedField>
        </div>
      </div>
    </div>
  );
};

export default SectionLeavesAndBreaks;
