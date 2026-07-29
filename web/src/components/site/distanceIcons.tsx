type IconProps = { className?: string };
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const IconAirport = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M11 3.5 12.8 3.3 13.5 9l6.2 3.6c.6.35.6 1.2 0 1.55L13.5 15l-.6 5.3 1.9 1.3v1.1h-5.6v-1.1l1.9-1.3-.6-5.3-6.2-1.15c-.6-.35-.6-1.2 0-1.55L10.7 9 11 3.5z" />
  </svg>
);
const IconBeach = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M4 11.5C4 7 7.6 4 12 4s8 3 8 7.5H4z" />
    <path d="M12 4v-.8M12 11.5V21M8.5 21h7" />
    <path d="M2.5 21c2-2.4 4-2.4 6 0 2-2.4 4-2.4 6 0 2-2.4 4-2.4 6 0" opacity="0.6" />
  </svg>
);
const IconMarket = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M4 9.5 5.2 4h13.6L20 9.5" />
    <path d="M4 9.5a2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0 4.4 0" />
    <path d="M5 9.8V20h14V9.8" />
    <path d="M10 20v-5.5h4V20" />
  </svg>
);
const IconRestaurant = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M7 3v7.5a2 2 0 0 1-2 2 2 2 0 0 1-2-2V3M5 3v18M5 12.5V3" />
    <path d="M17 3c-1.4 0-2.5 1.6-2.5 5s1.1 5 2.5 5v9M17 3c1.4 0 2.5 1.6 2.5 5s-1.1 5-2.5 5" />
  </svg>
);
const IconHealth = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);
const IconCity = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <path d="M4 20V8l5-3v15" />
    <path d="M14 20V4l6 3v13" />
    <path d="M2.5 20h19" />
    <path d="M6.5 10.5h1M6.5 13.5h1M6.5 16.5h1M17 8h1.2M17 11h1.2M17 14h1.2M17 17h1.2" />
  </svg>
);
const IconDefault = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} {...base}>
    <circle cx="12" cy="12" r="8" />
  </svg>
);

// Keys match the `icon` column in the distance_types table (migration 013).
export const DISTANCE_ICONS: Record<string, (p: IconProps) => JSX.Element> = {
  airport: IconAirport, beach: IconBeach, market: IconMarket,
  restaurant: IconRestaurant, health: IconHealth, city: IconCity
};

export function distanceIcon(key: string) {
  return DISTANCE_ICONS[key] ?? IconDefault;
}
