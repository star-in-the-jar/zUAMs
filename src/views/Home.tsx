import React from "react";
import { useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import { appState } from "@/store/appState";
import { normalizePensionValue } from "@/utils/normalizePensionValue";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const snap = useSnapshot(appState);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const normalized = normalizePensionValue(val);
    if (val === "") {
      appState.pension = "";
      appState.lastValid = "";
      return;
    }
    if (normalized === undefined) {
      appState.pension = appState.lastValid;
    } else {
      appState.pension = normalized;
      appState.lastValid = normalized;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (
      snap.pension === "" ||
      isNaN(Number(snap.pension)) ||
      Number(snap.pension) <= 0
    ) {
      return;
    }
    e.preventDefault();
    navigate("/calculator");
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <h1 className="text-4xl font-bold text-center mb-6">
        Jaka chcesz mieć emeryturę?
      </h1>
      <form onSubmit={handleSubmit} className="flex gap-x-1 items-center">
        <label className="input input-lg">
          <input
            value={snap.pension}
            className="grow"
            placeholder="3000"
            onInput={handleInput}
          />
          <span>PLN</span>
        </label>
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
