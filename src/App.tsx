import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/views/Home";
import Calculator from "@/views/Calculator";
import LogoZus from "@/components/LogoZus";

function App() {
  return (
    <div className="px-32 py-16 min-h-screen">
      <header className="flex items-center mb-16">
        <LogoZus />
      </header>
      <main className=" flex flex-col">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={<Calculator />} />
          </Routes>
        </BrowserRouter>
      </main>
    </div>
  );
}

export default App;
