type IconProps = { className?: string };
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const IconFamily = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <circle cx="8.5" cy="8" r="2.6" />
    <path d="M4 19c0-3 2-5 4.5-5s4.5 2 4.5 5" />
    <circle cx="16.5" cy="9.2" r="2.1" />
    <path d="M13.8 19c.2-2.6 1.9-4.4 4-4.4 2.2 0 3.9 1.9 4.2 4.4" />
  </svg>
);
const IconPaw = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <ellipse cx="12" cy="15.6" rx="4.3" ry="3.4" />
    <ellipse cx="6.3" cy="9.3" rx="1.6" ry="2" />
    <ellipse cx="10.4" cy="6.4" rx="1.6" ry="2" />
    <ellipse cx="14.6" cy="6.4" rx="1.6" ry="2" />
    <ellipse cx="18.2" cy="9.3" rx="1.6" ry="2" />
  </svg>
);
const IconBungalow = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M4 12 12 5l8 7" />
    <rect x="6" y="12" width="12" height="7" rx="0.6" />
    <path d="M10.5 19v-4h3v4" />
  </svg>
);
const IconActivity = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <circle cx="12" cy="12" r="8" />
    <path d="M15.2 8.8 13.4 13l-4.2 1.8 1.8-4.2 4.2-1.8z" />
  </svg>
);
const IconCrown = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M4 17 2.8 9.2 7 12l5-6.5L17 12l4.2-2.8L20 17H4z" />
    <path d="M5 19.5h14" />
  </svg>
);
const IconHeatedPool = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M3 16.2q2-2 4 0t4 0 4 0 4 0" />
    <path d="M3 19.2q2-2 4 0t4 0 4 0 4 0" />
    <path d="M8.6 4c-1 1.2-1 2.5 0 3.7M12 3c-1 1.2-1 2.7 0 3.9M15.4 4c-1 1.2-1 2.5 0 3.7" />
  </svg>
);
const IconTag = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M3 12.5 12.3 3.2H19a1.8 1.8 0 0 1 1.8 1.8v6.7L11.5 20.7 3 12.5z" />
    <circle cx="16.3" cy="7.7" r="1.15" />
  </svg>
);
const IconHeart = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M12 20s-7-4.3-9.2-8.9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5.1C19 15.7 12 20 12 20z" />
    <path d="M18 3.6 18.5 5l1.4.5-1.4.5-.5 1.4-.5-1.4L16.1 5.5l1.4-.5.5-1.4z" fill="currentColor" stroke="none" />
  </svg>
);
const IconDuck = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M6.2 17c0-3.2 2.1-5.3 5.1-5.3h1.8a3.9 3.9 0 1 0-2.9-6.5" />
    <circle cx="15.6" cy="5.9" r="0.9" fill="currentColor" stroke="none" />
    <path d="M3 17.2q2-1.6 4 0t4 0 4 0 4 0" />
  </svg>
);
const IconSeaView = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <circle cx="12" cy="8" r="3" />
    <path d="M4 12.3h16" />
    <path d="M3 16.2q2-2 4 0t4 0 4 0 4 0" />
    <path d="M3 19.2q2-2 4 0t4 0 4 0 4 0" />
  </svg>
);
const IconShield = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M12 3.2 19 6v5c0 5-3.5 8-7 9.8C8.5 19 5 16 5 11V6l7-2.8z" />
  </svg>
);
const IconJacuzzi = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <rect x="3.5" y="12" width="17" height="6.5" rx="2.2" />
    <path d="M3.5 15.2h17" opacity="0.5" />
    <circle cx="8.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="12" cy="4.6" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="7.4" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
const IconDefault = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <circle cx="12" cy="12" r="8" />
  </svg>
);

// Keys match the `icon` column in the categories table (migration 008).
export const CATEGORY_ICONS: Record<string, (p: IconProps) => JSX.Element> = {
  family: IconFamily, paw: IconPaw, bungalow: IconBungalow, activity: IconActivity,
  crown: IconCrown, 'heated-pool': IconHeatedPool, tag: IconTag, heart: IconHeart,
  duck: IconDuck, 'sea-view': IconSeaView, shield: IconShield, jacuzzi: IconJacuzzi
};

export function categoryIcon(key: string) {
  return CATEGORY_ICONS[key] ?? IconDefault;
}
