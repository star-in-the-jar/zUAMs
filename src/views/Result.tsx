import type React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";

const Result: React.FC = () => {
  const snap = useSnapshot(appState);

  return (
    <>
      <div>Result</div>
      <p>{snap.pension}</p>
    </>
  );
};

export default Result;
