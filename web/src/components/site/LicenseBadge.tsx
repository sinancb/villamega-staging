export function LicenseBadge({ licenseNo, authorityLabel, noLabel }: {
  licenseNo: string; authorityLabel: string; noLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-brass/50 bg-brass-soft/25 px-4 py-3">
      <svg viewBox="0 0 24 24" className="h-8 w-8 shrink-0 text-navy" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="12" cy="9.5" r="5.5" />
        <circle cx="12" cy="9.5" r="3" />
        <path d="M9 14 7 21l5-2.3L17 21l-2-7" />
      </svg>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-navy/60">{authorityLabel}</div>
        <div className="font-display text-sm font-bold text-navy">{noLabel}: {licenseNo}</div>
      </div>
    </div>
  );
}
