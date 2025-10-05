import React from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import { calculateRequiredSalaryForTargetPension } from "@/core/calculatePension";
import SectionAgeAndRetirement from "@/components/SectionAgeAndRetirement";
import LogoZus from "@/components/LogoZeus";

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
    <div className="items-start gap-x-6 lg:grid grid-cols-12 mx-auto mt-32 max-w-7xl">
      <div className="col-span-7">
        <div className="mb-4">
          <LogoZus />
        </div>
        <h1 className="mb-8 font-bold text-6xl">
          Poznaj <span className="text-primary">ZeUS</span>
        </h1>
        <p className="max-w-lg text-lg">
          ZeUS to nowoczesne narzędzie, które pozwala w prosty sposób
          przewidzieć swoją przyszłą emeryturę i świadomie planować finanse.
          Sprawdź, jak Twoje decyzje zawodowe, zarobki i oszczędności mogą
          wpłynąć na wysokość świadczenia.
          <br />
          Niezależnie od tego, czy dopiero zaczynasz karierę, czy już myślisz o
          przyszłości — ZeUS pomoże Ci zrozumieć system emerytalny i podjąć
          najlepsze decyzje na każdym etapie życia.
        </p>
      </div>
      <div className="col-span-5">
        <div className="flex flex-col justify-center items-center gap-y-4 mt-8 lg:mt-20 h-full">
          <h2 className="mb-4 font-semibold text-4xl text-center">
            Zaplanuj swoją emeryturę
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-x-1 w-full"
          >
            <div className="mb-6 w-full">
              <SectionAgeAndRetirement />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full btn btn-primary"
            >
              Sprawdź
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
