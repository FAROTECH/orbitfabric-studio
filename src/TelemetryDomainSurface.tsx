import {
  MissionModelAtlasSurface,
  type MissionModelAtlasSurfaceProps,
} from "./MissionModelAtlasSurface";

export function TelemetryDomainSurface(props: MissionModelAtlasSurfaceProps) {
  return <MissionModelAtlasSurface {...props} preferredDomainId="telemetry" />;
}
