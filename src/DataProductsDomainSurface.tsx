import {
  MissionModelAtlasSurface,
  type MissionModelAtlasSurfaceProps,
} from "./MissionModelAtlasSurface";

export function DataProductsDomainSurface(props: MissionModelAtlasSurfaceProps) {
  return <MissionModelAtlasSurface {...props} preferredDomainId="data_products" />;
}
