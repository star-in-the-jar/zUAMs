import React from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import SectionAgeAndRetirement from "@/components/SectionAgeAndRetirement";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const snap = useSnapshot(appState);

  const handleSubmit = (e: React.FormEvent) => {
    if (
      snap.pension === "" ||
      isNaN(Number(snap.pension)) ||
      Number(snap.pension) <= 0 ||
      !snap.gender
    ) {
      alert("Wybierz płeć, wiek i oczekiwaną wysokość emerytury");
      return;
    }
    e.preventDefault();
    navigate("/calculator");
  };

  return (
    <section className="flex flex-col justify-center items-center gap-y-4 mt-8 h-full">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-x-1">
        <SectionAgeAndRetirement />
        <button
          type="button"
          onClick={handleSubmit}
          className="btn btn-primary btn-md"
        >
          Sprawdź
        </button>
      </form>
    </section>
  );
};

export default Home;
