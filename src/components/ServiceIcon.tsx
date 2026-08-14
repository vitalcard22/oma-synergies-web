import { GraduationCapIcon, PenIcon, PassportIcon, ScaleIcon, CardIcon, PlaneIcon, HomeIcon, CompassIcon } from './Icons';

export type ServiceIconKey = 'graduation' | 'pen' | 'passport' | 'scale' | 'card' | 'plane' | 'home' | 'compass';

interface Props {
  icon: ServiceIconKey;
  size?: number;
}

// Single source of truth for mapping a service's icon key to its real icon
// component, so every page that renders a service icon (Services, ServiceDetail,
// and Home's own local service lists) stays in sync through one shared map
// instead of drifting across separate lookup logic.
export default function ServiceIcon({ icon, size = 24 }: Props) {
  switch (icon) {
    case 'graduation': return <GraduationCapIcon size={size} />;
    case 'pen': return <PenIcon size={size} />;
    case 'passport': return <PassportIcon size={size} />;
    case 'scale': return <ScaleIcon size={size} />;
    case 'card': return <CardIcon size={size} />;
    case 'plane': return <PlaneIcon size={size} />;
    case 'home': return <HomeIcon size={size} />;
    case 'compass': return <CompassIcon size={size} />;
  }
}
