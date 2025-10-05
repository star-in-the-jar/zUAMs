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
  const [tempAgeValue, setTempAgeValue] = useState<string>("");
  const [showAgeError, setShowAgeError] = useState(false);
  const snap = useSnapshot(appState);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTempAgeValue(val);

    // Check if the value is invalid and show error
    const num = Number(val);
    const isValid = !isNaN(num) && num >= MIN_AGE && num <= MAX_AGE;
    setShowAgeError(!isValid && val !== "");

    // Only update global state if the value is a valid number within range
    if (isValid) {
      setAndMarkAsChanged("age", num);
      setAndMarkAsChanged("retirementAge", Math.max(snap.retirementAge, num));
    }
  };

  const handleAgeBlur = () => {
    const num = Number(tempAgeValue);

    // Clear error state on blur
    setShowAgeError(false);

    // On blur, validate and set to closest valid value if needed
    if (isNaN(num) || num < MIN_AGE) {
      setAndMarkAsChanged("age", MIN_AGE);
      setAndMarkAsChanged("retirementAge", Math.max(snap.retirementAge, MIN_AGE));
      setTempAgeValue(MIN_AGE.toString());
    } else if (num > MAX_AGE) {
      setAndMarkAsChanged("age", MAX_AGE);
      setAndMarkAsChanged("retirementAge", Math.max(snap.retirementAge, MAX_AGE));
      setTempAgeValue(MAX_AGE.toString());
    } else {
      // Valid value, ensure it's set
      setAndMarkAsChanged("age", num);
      setAndMarkAsChanged("retirementAge", Math.max(snap.retirementAge, num));
      setTempAgeValue(num.toString());
    }
  };

  const handleAgeFocus = () => {
    // When focusing, use the current global state value
    setTempAgeValue(snap.age.toString());
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
              <div className="w-full input">
                <input
                  value={snap.pension}
                  className="grow"
                  type="number"
                  onChange={(e) => handlePensionChange(e, setShowPensionWarning)}
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
                  className="hover:text-red-700 underline"
                >
                  Więcej informacji
                </a>
              </span>
            </div>
          )}

          <div className="form-control">
            <span className="font-medium label-text">Jesteś</span>
            <GenderButtons />
            <span className="font-medium text-sm text-base-content/70">
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
            <div className={`w-full input ${showAgeError ? 'input-error' : ''}`}>
              <input
                value={tempAgeValue || snap.age}
                className="grow"
                type="number"
                onChange={handleAgeChange}
                onBlur={handleAgeBlur}
                onFocus={handleAgeFocus}
                min={MIN_AGE}
                max={MAX_AGE}
              />
              lat
            </div>
            {showAgeError && (
              <label className="label">
                <span className="label-text-alt text-error">
                  Wiek musi być między {MIN_AGE} a {MAX_AGE} lat
                </span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionAgeAndRetirement;
