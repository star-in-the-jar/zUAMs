import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import type { Gender } from "@/const/genders";

type GenderField = {
  children: React.ReactNode;
  gender: Gender;
};

const GenderField = (props: GenderField) => {
  const snap = useSnapshot(appState);

  return <>{snap.gender === props.gender ? props.children : null}</>;
};

export default GenderField;
