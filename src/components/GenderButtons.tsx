import { GENDERS, type Gender } from "@/const/genders";
import { useSnapshot } from "valtio";
import { appState, setAndMarkAsChanged } from "@/store/appState";
import { classMerge } from "@/utils/classMerge";
import { RETIREMENT_AGE } from "@/const/age";

function getGenderLabel(gender: Gender) {
  switch (gender) {
    case GENDERS.MALE:
      return "Mężczyzną";
    case GENDERS.FEMALE:
      return "Kobietą";
    default:
      return "Nieznana płeć";
  }
}

const GenderButtons = () => {
  const snap = useSnapshot(appState);

  const onClick = (gender: Gender) => {
    setAndMarkAsChanged("gender", gender);
    setAndMarkAsChanged("retirementAge", RETIREMENT_AGE[gender]);
  };

  const renderButtonByGender = (gender: Gender) => {
    const isActiveGender = snap.gender === gender;
    const isLeftButton = gender === GENDERS.MALE;
    return (
      <button
        type="button"
        className={classMerge(
          "btn w-1/2",
          isActiveGender ? "btn-primary" : undefined,
          isLeftButton ? "rounded-r-none" : "rounded-l-none"
        )}
        onClick={() => onClick(gender)}
      >
        {getGenderLabel(gender)}
      </button>
    );
  };

  return (
    <div className="btn-group w-full">
      {renderButtonByGender(GENDERS.MALE)}
      {renderButtonByGender(GENDERS.FEMALE)}
    </div>
  );
};

export default GenderButtons;
