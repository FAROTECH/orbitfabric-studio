import {
  MissionModelAtlasSurface,
  type MissionModelAtlasSurfaceProps,
} from "./MissionModelAtlasSurface";

export function CommandsDomainSurface(props: MissionModelAtlasSurfaceProps) {
  return <MissionModelAtlasSurface {...props} preferredDomainId="commands" />;
}
