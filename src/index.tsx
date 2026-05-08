import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import "./index.css";

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  </React.StrictMode>,
);
