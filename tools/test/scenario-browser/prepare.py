"""Export real R1 reports for opt-in browser acceptance. No hand-authored semantics."""
import argparse
import json
from pathlib import Path
import subprocess
import tempfile

parser = argparse.ArgumentParser()
parser.add_argument("reference_root", type=Path)
parser.add_argument("--core", default="orbitfabric")
args = parser.parse_args()
root = args.reference_root.resolve()
mission = root / "mission"
scenario = root / "scenarios/payload_stop_acquisition_verification.yaml"
commands = {
    "run_core_version": ["--version"],
    "run_core_export_mission_snapshot": ["export", "mission-snapshot", str(mission)],
    "run_core_export_entity_index": ["export", "entity-index", str(mission)],
    "run_core_export_relationship_manifest": ["export", "relationship-manifest", str(mission)],
    "run_core_lint_mission": ["lint", str(mission)],
    "run_core_export_scenario_declaration": ["export", "scenario-declaration", str(scenario)],
}
reports = {"missionPath": str(mission), "scenarioPath": str(scenario), "invocations": {}}
with tempfile.TemporaryDirectory(prefix="sp2-export-") as temporary:
    for command, argv in commands.items():
        report = Path(temporary) / (command + ".json")
        if command != "run_core_version":
            argv = [*argv, "--json", str(report)]
        process = subprocess.run([args.core, *argv], capture_output=True, text=True, timeout=60)
        text = report.read_text() if report.exists() else None
        if command != "run_core_version" and text is None:
            raise RuntimeError(process.stderr or process.stdout)
        reports["invocations"][command] = {
            "operation": command, "executable": args.core, "args": argv,
            "exitCode": process.returncode, "processCompleted": True, "timedOut": False,
            "stdout": process.stdout, "stderr": process.stderr,
            "reportPath": str(report), "reportText": text,
        }
destination = Path(".sp2-acceptance")
destination.mkdir(exist_ok=True)
(destination / "reports.json").write_text(json.dumps(reports, indent=2) + "\n")
print("Exported real Core reports for browser acceptance")
