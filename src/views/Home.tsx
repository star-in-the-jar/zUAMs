import React from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import { calculateRequiredSalaryForTargetPension } from "@/core/calculatePension";
import SectionAgeAndRetirement from "@/components/SectionAgeAndRetirement";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const snap = useSnapshot(appState);

  const handleSubmit = (e: React.FormEvent) => {
    if (
      isNaN(Number(snap.pension)) ||
      Number(snap.pension) <= 0 ||
      !snap.gender
    ) {
      alert("Wybierz płeć, wiek i oczekiwaną wysokość emerytury");
      return;
    }
    const requiredSalary = calculateRequiredSalaryForTargetPension(appState);
    if (requiredSalary) {
      appState.monthlyGrossSalary = Math.round(requiredSalary);
    }
    e.preventDefault();
    navigate("/calculator");
  };

  return (
    <section className="flex flex-col justify-center items-center gap-y-4 mt-8 h-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-x-1"
      >
        <SectionAgeAndRetirement />
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary btn-lg"
        >
          Sprawdź
        </button>
      </form>
    </section>
  );
};

export default Home;
