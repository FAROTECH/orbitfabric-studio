import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./styles.css";
import "./missionCockpitVisualHierarchy.css";
import "./missionDataFlowWorkbenchVisualHierarchy.css";
import "./generatedArtifactExplorer.css";
import "./releaseHardening.css";
import "./scenarioTimelineRunner.css";
import "./scenarioRunwayConsole.css";
import "./scenarioRunwayTargetBay.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
