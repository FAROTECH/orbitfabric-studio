import {
  MissionModelAtlasSurface,
  type MissionModelAtlasSurfaceProps,
} from "./MissionModelAtlasSurface";

export function SpacecraftDomainSurface(props: MissionModelAtlasSurfaceProps) {
  return <MissionModelAtlasSurface {...props} preferredDomainId="spacecraft" />;
}
