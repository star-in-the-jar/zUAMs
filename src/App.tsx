import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "@/views/Home";
import Calculator from "@/views/Calculator";
import Layout from "@/components/Layout";
import LogoZeus from "@/components/LogoZeus";
import ZusScenarioView from "./views/ZusScenarioView";
import SavingsScenarioView from "./views/SavingsScenarioView";

function App() {
  return (
    <div className="p-4 lg:px-16 lg:py-8 min-h-screen">
      <BrowserRouter>
        <main>
          <Link to="/">
            <header className="flex justify-center items-center pb-8">
              <LogoZeus />
            </header>
          </Link>
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
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
