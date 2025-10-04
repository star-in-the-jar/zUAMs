import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/views/Home";
import Calculator from "@/views/Calculator";
import Layout from "@/components/Layout";
import LogoZeus from "@/components/LogoZeus";
import ZusScenarioView from "./views/ZusScenarioView";
import SavingsScenarioView from "./views/SavingsScenarioView";

function App() {
  return (
    <div className="px-32 py-16 min-h-screen">
      <header className="flex justify-center items-center pb-8">
        <LogoZeus />
      </header>
      <main>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/zus-scenario-view" element={<ZusScenarioView />} />
              <Route
                path="/savings-scenario-view"
                element={<SavingsScenarioView />}
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </main>
    </div>
  );
}

export default App;
