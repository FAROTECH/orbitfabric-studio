import React from "react";
import ReactDOM from "react-dom/client";
import "@xyflow/react/dist/style.css";

import App from "./App";
import "./styles/tokens.css";
import "./styles/reset.css";
import "./styles/shell.css";
import "./styles/features.css";
import "./styles/relations.css";
import "./styles/context-map.css";
import "./styles/operations.css";
import "./styles/responsive.css";

// Studio owns contextual actions. Never expose the browser/WebView menu.
document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
