import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/views/Home";
import Result from "@/views/Result";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
