import { distanceIcon } from '@/components/site/distanceIcons';

export type DistanceItem = { icon: string; label: string; km: number; note: string | null };

export function DistanceInfo({ title, items, mapUrl, mapButtonLabel, kmSuffix }: {
  title: string;
  items: DistanceItem[];
  mapUrl: string | null;
  mapButtonLabel: string;
  kmSuffix: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl bg-navy-mist px-6 py-8 md:px-10 md:py-10">
      <h2 className="font-display text-2xl font-semibold text-navy">{title}</h2>

      <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = distanceIcon(item.icon);
          return (
            <div key={item.label} className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className="h-6 w-6 text-brass" />
              </span>
              <div>
                <div className="text-base text-navy">
                  {item.label}
                  {item.note && <span className="ml-1 text-sm text-navy/50">({item.note})</span>}
                </div>
                <div className="text-sm font-semibold text-aegean-600">{item.km} {kmSuffix}</div>
              </div>
            </div>
          );
        })}
      </div>

      {mapUrl && (
        <div className="mt-8 flex justify-center">
          <a href={mapUrl} target="_blank" rel="noopener noreferrer"
            className="rounded-full bg-aegean-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-aegean-500">
            {mapButtonLabel}
          </a>
        </div>
      )}
    </section>
  );
}
