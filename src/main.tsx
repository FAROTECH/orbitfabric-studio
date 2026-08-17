import React from "react";
import ReactDOM from "react-dom/client";
import "@xyflow/react/dist/style.css";

import App from "./App";
import "./styles/tokens.css";
import "./styles/reset.css";
import "./styles/shell.css";
import "./styles/features.css";
import "./styles/relations.css";
import "./styles/responsive.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
