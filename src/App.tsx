import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/views/Home";
import Calculator from "@/views/Calculator";

function App() {
  return (
    <div className="px-32 py-16 min-h-screen flex flex-col">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<Calculator />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
