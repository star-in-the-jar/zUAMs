import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/views/Home";
import Calculator from "@/views/Calculator";
import Layout from "@/components/Layout";
import LogoZeus from "@/components/LogoZeus";

function App() {
  return (
    <div className="px-32 py-16 min-h-screen">
      <header className="flex items-center mb-16">
        <LogoZeus />
      </header>
      <main className="flex flex-col min-h-screen">
        <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={<Calculator />} />
          </Routes>
        </Layout>
        </BrowserRouter>
      </main>
    </div>
  );
}

export default App;
