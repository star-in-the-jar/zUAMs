import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/views/Home";
import Calculator from "@/views/Calculator";
import Layout from "@/components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <div className="flex flex-col px-32 py-16 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={<Calculator />} />
          </Routes>
        </div>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
