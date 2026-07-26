import { MONTH_TR, MONTH_EN } from '@/lib/calendar';
import type { Locale } from '@/lib/i18n';
import type { ShortStayMonth } from '@/lib/site-queries';

export function ShortStayAvailability({ locale, title, sub, nightsLabel, countSuffix, months }: {
  locale: Locale; title: string; sub: string; nightsLabel: string; countSuffix: string; months: ShortStayMonth[];
}) {
  const monthNames = locale === 'tr' ? MONTH_TR : MONTH_EN;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="font-display text-3xl font-semibold text-navy">{title}</h2>
      <div className="mt-3 h-px w-14 bg-brass" />
      <p className="mb-8 mt-3 text-sm text-navy/60">{sub}</p>

      <div className="-mr-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 pl-4 pr-4 sm:mr-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 sm:pl-0 sm:pr-0 lg:grid-cols-4">
        {months.map(({ month, counts }) => (
          <div key={month.toISOString()} className="w-[78%] shrink-0 snap-start sm:w-auto sm:shrink">
            <h3 className="font-display mb-3 text-lg font-semibold text-navy">
              {monthNames[month.getMonth()]}
            </h3>
            <div className="space-y-2">
              {counts.map(({ nights, count }) => (
                <div key={nights}
                  className="flex items-center justify-between rounded-lg border border-navy/10 px-4 py-3 text-sm">
                  <span className="text-navy">{nights} {nightsLabel}</span>
                  <span className="font-semibold text-brass">{count} {countSuffix}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
