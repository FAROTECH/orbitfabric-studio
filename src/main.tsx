import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./styles.css";
import "./missionCockpitVisualHierarchy.css";
import "./missionContentCockpit.css";
import "./missionWorkspaceTopbarHeroFix.css";
import "./missionDataFlowWorkbenchVisualHierarchy.css";
import "./missionDataFlowWorkbenchStep2.css";
import "./missionDataFlowWorkbenchStep5.css";
import "./missionDataFlowWorkbenchDrawer.css";
import "./missionDataFlowWorkbenchFocusMode.css";
import "./missionDataFlowWorkbenchTimeline.css";
import "./generatedArtifactExplorer.css";
import "./generatedArtifactDeck.css";
import "./generatedArtifactDeckStabilization.css";
import "./coreReportRunner.css";
import "./missionModelAtlas.css";
import "./releaseHardening.css";
import "./scenarioTimelineRunner.css";
import "./scenarioRunwayConsole.css";
import "./scenarioRunwayTargetBay.css";
import "./scenarioRunwayOverflow.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
