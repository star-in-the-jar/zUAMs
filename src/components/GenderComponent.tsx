import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import type { Gender } from "@/const/genders";

type GenderComponent = {
  children: React.ReactNode;
  gender: Gender;
};

const GenderComponent = (props: GenderComponent) => {
  const snap = useSnapshot(appState);

  return <>{snap.gender === props.gender ? props.children : null}</>;
};

export default GenderComponent;
