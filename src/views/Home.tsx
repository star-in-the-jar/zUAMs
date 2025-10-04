import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [pension, setPension] = useState<string>("");
  const [lastValid, setLastValid] = useState<string>("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setPension("");
      setLastValid("");
      return;
    }
    if (isNaN(Number(val))) {
      setPension(lastValid);
    } else {
      setPension(val);
      setLastValid(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (pension === "" || isNaN(Number(pension)) || Number(pension) <= 0) {
      return;
    }
    e.preventDefault();
    navigate("/result");
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <h1 className="text-4xl font-bold text-center mb-6">
        Jaka chcesz mieć emeryturę?
      </h1>
      <form onSubmit={handleSubmit} className="flex gap-x-1 items-center">
        <label className="input input-lg">
          <input
            value={pension}
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
