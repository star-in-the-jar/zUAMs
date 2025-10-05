import React, { useState } from "react";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import GenderButtons from "@/components/GenderButtons";
import { MIN_AGE, MAX_AGE } from "@/const/age";

const MAX_PENSION_LIMIT = 55000;
const MIN_PENSION_LIMIT = 1710;
const REAL_PENSION_ARTICLE_URL =
  "https://www.rynekzdrowia.pl/Finanse-i-zarzadzanie/Przeszedl-na-emeryture-w-wieku-86-lat-Przelew-co-miesiac-zwala-z-nog,274208,1.html";

const handlePensionChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setShowWarning: React.Dispatch<React.SetStateAction<boolean>>,
  setPensionWarningMessage: React.Dispatch<React.SetStateAction<string>>
) => {
  const val = e.target.value;
  const num = Number(val);

  if (!isNaN(num)) {
    if (num > MAX_PENSION_LIMIT) {
      appState.pension = MAX_PENSION_LIMIT;
      setShowWarning(true);
      setPensionWarningMessage(
        `Emerytura nie może być wyższa niż ${MAX_PENSION_LIMIT} zł.`
      );
    } else if (num < MIN_PENSION_LIMIT) {
      appState.pension = num; // Pozwól użytkownikowi wpisać dowolną wartość
      setShowWarning(true);
      setPensionWarningMessage(
        `Emerytura nie może być niższa niż ${MIN_PENSION_LIMIT} zł.`
      );
    } else {
      appState.pension = num;
      setShowWarning(false);
    }
  }
};

const SectionAgeAndRetirement: React.FC = () => {
  const [showPensionWarning, setShowPensionWarning] = useState(false);
  const [pensionWarningMessage, setPensionWarningMessage] = useState("");
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
              <div className="w-full input">
                <input
                  value={snap.pension}
                  className="grow"
                  type="number"
                  onChange={(e) =>
                    handlePensionChange(
                      e,
                      setShowPensionWarning,
                      setPensionWarningMessage
                    )
                  }
                />
                zł
              </div>
            </label>
          </div>

          {showPensionWarning && (
            <div className="mt-2 text-error">
              <span className="text-red-600 text-xs">
                {pensionWarningMessage}
              </span>
            </div>
          )}

          <div className="mt-2 text-xs">
            <span className="text-xs text-base-content/70">
              Minimalna emerytura to {MIN_PENSION_LIMIT} zł, a maksymalna
              dopuszczana to {MAX_PENSION_LIMIT} zł. Ciekawostka: najwięcej
              wypłacane świadczenie z ZUS wynosiło 51,400 zł. &rarr;{" "}
              <a
                href={REAL_PENSION_ARTICLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 underline"
              >
                Więcej informacji
              </a>
            </span>
          </div>

          <div className="form-control">
            <span className="font-medium label-text">Kim jesteś?</span>
            <GenderButtons />
            <span className="text-xs text-base-content/70">
              Mężczyźni mogą przejść na emeryturę w wieku 65 lat, kobiety w wieku 60 lat
            </span>
          </div>

          <div className="form-control">
            <label>
              <span className="font-medium label-text">
                W jakim wieku jesteś?
              </span>
            </label>
            <div className="w-full input">
              <input
                value={snap.age}
                className="grow"
                type="number"
                min={MIN_AGE}
                max={MAX_AGE}
                onChange={handleAgeChange}
                aria-label="Wprowadź swój wiek"
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
