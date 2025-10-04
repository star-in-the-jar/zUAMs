import type React from "react";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";

const Result: React.FC = () => {
  const snap = useSnapshot(appState);

  return (
    <>
      <h1 className="text-4xl font-semibold">Zakładając, że</h1>

      <form className="flex flex-col gap-y-2">
        <ol>
          <li>Jesteś </li>
          <li>
            Masz obecnie <span className="text-secondary">XX lat</span>
          </li>
          <li>Przejdziesz na emeryturę w wieku XX (XXXXr.)</li>
        </ol>
      </form>
      <h2>Otrzymasz emeryturę w wysokości 2000 PLN netto</h2>
    </>
  );
};

export default Result;
