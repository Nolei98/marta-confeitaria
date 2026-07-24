type IconProps = { size?: number };

const base = { fill: "none" as const, stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function HeartIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M20.8 8.6c0 4.6-8.8 10.2-8.8 10.2S3.2 13.2 3.2 8.6a4.6 4.6 0 0 1 8.8-1.8A4.6 4.6 0 0 1 20.8 8.6z" />
    </svg>
  );
}

export function LeafIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M5 21c8 0 14-6 14-14V4h-3C8 4 3 9 3 16v5z" />
      <path d="M5 21c3-5 6-8 12-11" />
    </svg>
  );
}

export function TagIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M20.4 12.6 12.6 20.4a1.8 1.8 0 0 1-2.5 0l-6.5-6.5a1.8 1.8 0 0 1 0-2.5L11.4 3.6a1.8 1.8 0 0 1 1.3-.5l6 .2a1.8 1.8 0 0 1 1.7 1.7l.2 6a1.8 1.8 0 0 1-.2 1.6z" />
      <circle cx="15.5" cy="8.5" r="1.4" />
    </svg>
  );
}

export function ClockIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  );
}

export function MapPinIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M12 21s7-6.4 7-11.5A7 7 0 0 0 5 9.5C5 14.6 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </svg>
  );
}

export function MailIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 6.5 8 6.2 8-6.2" />
    </svg>
  );
}

export function WhatsAppIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm5.8 14.07c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.17-1.55-1.17-2.96 0-1.4.74-2.09 1-2.38.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.49-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.69-.8.88-1.08.19-.28.37-.23.63-.14.26.09 1.64.77 1.92.91.28.14.47.21.53.33.07.12.07.68-.17 1.36z" />
    </svg>
  );
}

export function BoxIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
    </svg>
  );
}

export function TrendingUpIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 6h6v6" />
    </svg>
  );
}

export function MessageCircleIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M21 11.5a8.4 8.4 0 0 1-8.9 8.4 8.7 8.7 0 0 1-3.8-.9L3 20l1.1-5.1A8.4 8.4 0 1 1 21 11.5z" />
    </svg>
  );
}

export function BookOpenIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function WhiskIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M12 3v7" />
      <path d="M8 4.5c0 4 1.8 6 4 6s4-2 4-6" />
      <path d="M6 6c0 5 2.7 8 6 8s6-3 6-8" />
      <path d="M12 14v3" />
      <rect x="10.6" y="17" width="2.8" height="4" rx="1.4" />
    </svg>
  );
}

export function CupcakeIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M8 10c-1.5-1-2-4 .5-5 .3-1.6 1.8-3 3.5-3s3.2 1.4 3.5 3c2.5 1 2 4 .5 5" />
      <path d="M5 10h14l-1.4 9.2a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8z" />
      <path d="M5 10a2 2 0 0 1 0-4M19 10a2 2 0 0 0 0-4" />
    </svg>
  );
}

export function CookieIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M20.5 13a2.2 2.2 0 0 1-2.4-2.6 2.2 2.2 0 0 1-2.7-2.7A2.2 2.2 0 0 1 12.8 5 8.5 8.5 0 1 0 20.5 13z" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="13" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RollingPinIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <rect x="6" y="9" width="12" height="6" rx="2" />
      <path d="M2 12h4M18 12h4" />
      <path d="M3 10v4M21 10v4" />
    </svg>
  );
}

export function PipingBagIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M7 3h10l-1.2 6.5a2 2 0 0 1-.4.9L12 14l-3.4-3.6a2 2 0 0 1-.4-.9z" />
      <path d="M12 14v4l-2 3h4l-2-3" />
    </svg>
  );
}

export function LogOutIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function CakeSliceIcon({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M4 20h16" />
      <path d="M5 20V11c0-4 3-7.5 7-7.5s7 3.5 7 7.5v9" />
      <path d="M5 14.5h14" />
    </svg>
  );
}
