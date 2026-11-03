import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { configureHost } from "@/lib/platform";
import DEFAULT_CONFIG from "@/lib/default-config";

configureHost({ defaultConfig: DEFAULT_CONFIG });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
