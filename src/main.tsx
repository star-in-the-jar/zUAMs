import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ZusChatbot from "./components/ZusChatbot";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ZusChatbot />
    <App />
  </StrictMode>
);
