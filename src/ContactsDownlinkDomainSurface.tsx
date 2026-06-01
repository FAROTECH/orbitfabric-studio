import {
  MissionModelAtlasSurface,
  type MissionModelAtlasSurfaceProps,
} from "./MissionModelAtlasSurface";

export function ContactsDownlinkDomainSurface(props: MissionModelAtlasSurfaceProps) {
  return <MissionModelAtlasSurface {...props} preferredDomainId="contacts_downlink" />;
}
