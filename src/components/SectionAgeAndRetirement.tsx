import React, { useState } from "react";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import GenderButtons from "@/components/GenderButtons";
import { MIN_AGE, MAX_AGE } from "@/const/age";

const MAX_PENSION_LIMIT = 55000;
const REAL_PENSION_ARTICLE_URL =
  "https://www.rynekzdrowia.pl/Finanse-i-zarzadzanie/Przeszedl-na-emeryture-w-wieku-86-lat-Przelew-co-miesiac-zwala-z-nog,274208,1.html";

const handlePensionChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setShowWarning: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const val = e.target.value;
  const num = Number(val);

  if (!isNaN(num)) {
    if (num > MAX_PENSION_LIMIT) {
      appState.pension = MAX_PENSION_LIMIT;
      setShowWarning(true);
    } else {
      appState.pension = num;
      setShowWarning(false);
    }
  }
};

const SectionAgeAndRetirement: React.FC = () => {
  const [showPensionWarning, setShowPensionWarning] = useState(false);
  const snap = useSnapshot(appState);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = Number(val);
    if (!isNaN(num) && num > MIN_AGE && num < MAX_AGE) {
      setAndMarkAsChanged("age", num);
      setAndMarkAsChanged("retirementAge", Math.max(snap.retirementAge, num));
    }
  };

  return (
    <div className="bg-white text-base-content card">
      <div>
        <div className="flex flex-col gap-y-4">
          <div className="form-control">
            <label>
              <span className="font-medium label-text">
                Jaką emeryturę miesięczną chciałbyś mieć?
              </span>
              <div className="input w-full">
                <input
                  value={snap.pension}
                  className="grow"
                  type="number"
                  onChange={handlePensionChange}
                />
                zł
              </div>
            </label>
          </div>

          {showPensionWarning && (
            <div className="mt-2 text-error">
              <span className="text-red-600 text-xs">
                Maksymalne wypłacane świadczenie stan na sierpień 2025 to 51400
                zł. &rarr;{" "}
                <a
                  href={REAL_PENSION_ARTICLE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-red-700"
                >
                  Więcej informacji
                </a>
              </span>
            </div>
          )}

          <div className="form-control">
            <span className="font-medium label-text">Jesteś</span>
            <GenderButtons />
            <span className="text-sm text-base-content/70 font-medium">
              Mężczyźni mogą prześć na emeryturę w wieku 65 lat
              <br />
              Kobiety w wieku 60 lat
            </span>
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
