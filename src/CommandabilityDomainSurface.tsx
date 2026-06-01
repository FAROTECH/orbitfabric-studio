import { MissionModelAtlasSurface } from "./MissionModelAtlasSurface";
import type { MissionModelAtlasSurfaceProps } from "./MissionModelAtlasSurface";

export function CommandabilityDomainSurface(props: MissionModelAtlasSurfaceProps) {
  return <MissionModelAtlasSurface {...props} preferredDomainId="commandability" />;
}
