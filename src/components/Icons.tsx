interface IconProps {
  size?: number;
  className?: string;
}

export function MailIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 6.5C3 5.67157 3.67157 5 4.5 5H19.5C20.3284 5 21 5.67157 21 6.5V17.5C21 18.3284 20.3284 19 19.5 19H4.5C3.67157 19 3 18.3284 3 17.5V6.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 6.5L12 12.5L20 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.873.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.031 2.001c-5.523 0-10 4.477-10 10 0 1.762.462 3.494 1.34 5.014L2.05 22l5.121-1.34c1.463.799 3.114 1.221 4.86 1.221 5.523 0 10-4.477 10-10 0-2.673-1.041-5.184-2.93-7.072-1.889-1.888-4.398-2.808-7.07-2.808zm0 18.183c-1.622 0-3.212-.435-4.599-1.259l-.33-.196-3.037.795.812-2.96-.215-.305a8.126 8.126 0 01-1.386-4.558c0-4.498 3.658-8.156 8.157-8.156 2.178 0 4.225.85 5.766 2.392a8.099 8.099 0 012.39 5.766c.002 4.499-3.657 8.481-7.558 8.481z" />
    </svg>
  );
}

export function MapPinIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 21C12 21 19 15.4183 19 10C19 6.13401 15.866 3 12 3C8.13401 3 5 6.13401 5 10C5 15.4183 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function InstagramIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.5 2h-2.9v13.4c0 1.4-1.1 2.6-2.6 2.6s-2.6-1.2-2.6-2.6 1.1-2.6 2.6-2.6c.3 0 .5 0 .8.1V9.8c-.3 0-.5-.1-.8-.1-3 0-5.5 2.5-5.5 5.5S8 20.7 11 20.7s5.5-2.5 5.5-5.5V8.4c1.1.8 2.5 1.3 4 1.3V6.8c-2.2 0-4-1.8-4-4Z" />
    </svg>
  );
}

export function LinkedInIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 10V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7.5" cy="7" r="0.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M11.5 17V13.2C11.5 11.9 12.4 11 13.6 11C14.8 11 15.5 11.9 15.5 13.2V17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.5 17V10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function XIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.6 10.6 20 3h-1.6l-5.6 6.5L8.3 3H3l6.7 9.8L3 21h1.6l5.9-6.9 4.8 6.9H21l-7.4-10.4Zm-2.1 2.4-.7-1L5.4 4.2h2.4l4.4 6.3.7 1 5.7 8.2h-2.4l-4.7-6.7Z" />
    </svg>
  );
}

export function GraduationCapIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M2 8L12 3L22 8L12 13L2 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 10.5V16C6 16 8.5 18 12 18C15.5 18 18 16 18 16V10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 8V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CompassIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15 9L13 13L9 15L11 11L15 9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

export function PenIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 20L4.8 16.5L15.5 5.8C16.1 5.2 17.1 5.2 17.7 5.8L18.2 6.3C18.8 6.9 18.8 7.9 18.2 8.5L7.5 19.2L4 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 7.5L16.5 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PassportIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 15.5C8.5 14.4 10 13.5 12 13.5C14 13.5 15.5 14.4 15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ScaleIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3V19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 21H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 7H10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 7H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 7L2 11.5C2 13 3.5 14 5 14C6.5 14 8 13 8 11.5L6 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 7L18 11.5C18 13 19.5 14 21 14C22.5 14 24 13 24 11.5L22 7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function CardIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9.5H21" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 14.5H10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PlaneIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M13 3L21 11L17.5 11.5L13.5 8.5L11 15L13 17L13 18.5L9.5 17L8 19L6.5 18.5L7.5 16L5.5 13.5L3.5 14L3 12.5L5.5 10.5L11.5 9L8.5 5.5L9 3L10.5 3.5L13 6.5L13 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}

export function HomeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 11L12 4L20 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 9.5V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V9.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 20V15C10 14.4477 10.4477 14 11 14H13C13.5523 14 14 14.4477 14 15V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function GlobeIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12H21" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 3C14.5 5.5 15.8 8.6 15.8 12C15.8 15.4 14.5 18.5 12 21C9.5 18.5 8.2 15.4 8.2 12C8.2 8.6 9.5 5.5 12 3Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
