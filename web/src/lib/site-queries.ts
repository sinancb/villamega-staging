import { supabaseServer } from '@/lib/supabase/server';
import type { Locale } from '@/lib/i18n';
import { iso } from '@/lib/calendar';

export { placeholderFor, coverUrl, todayNightly } from '@/lib/villa-display';

export type VillaSearch = {
  region?: string;
  categorySlug?: string;
  minCapacity?: number;
  checkin?: string;
  checkout?: string;
};

const VILLA_SELECT = '*, villa_translations(*), villa_photos(storage_path, sort_order), price_seasons(start_date, end_date, nightly_price)';

export async function fetchActiveVillas(search: VillaSearch = {}) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .rpc('search_villas', {
      p_region: search.region ?? null,
      p_category_slug: search.categorySlug ?? null,
      p_min_capacity: search.minCapacity ?? null,
      p_checkin: search.checkin ?? null,
      p_checkout: search.checkout ?? null
    })
    .select(VILLA_SELECT);

  // search_villas() lands with migration 008 — until it's applied, fall back
  // to a plain query (region/capacity only) so the site keeps working.
  if (error) {
    let query = supabase.from('villas').select(VILLA_SELECT)
      .eq('status', 'active').order('created_at', { ascending: true });
    if (search.region) query = query.eq('region', search.region);
    if (search.minCapacity) query = query.gte('capacity', search.minCapacity);
    const fallback = await query;
    return fallback.data ?? [];
  }
  return data ?? [];
}

export async function fetchCategories(locale: Locale) {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('categories')
    .select('id, slug, icon, sort_order, category_translations(locale, label)')
    .order('sort_order', { ascending: true });
  return (data ?? []).map((c: any) => ({
    id: c.id as string,
    slug: c.slug as string,
    icon: c.icon as string,
    label: c.category_translations?.find((t: any) => t.locale === locale)?.label
      ?? c.category_translations?.find((t: any) => t.locale === 'tr')?.label
      ?? c.slug
  }));
}

export type ShortStayMonth = { month: Date; counts: { nights: number; count: number }[] };

// For each of the next `monthsAhead` months, how many active villas have an
// open window of each length in `nightOptions` starting within that month.
// Real availability, computed from get_unavailable_ranges() per villa —
// cheap at our current villa count, no new RPC needed.
export async function fetchShortStayAvailability(
  monthsAhead = 4,
  nightOptions = [2, 3, 4, 5, 6]
): Promise<ShortStayMonth[]> {
  const supabase = supabaseServer();
  const { data: villas } = await supabase
    .from('villas').select('id, default_min_stay').eq('status', 'active');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const villaBlocked = await Promise.all((villas ?? []).map(async (v: any) => {
    const { data: ranges } = await supabase.rpc('get_unavailable_ranges', { p_villa_id: v.id });
    const blocked = new Set<string>();
    for (const r of (ranges ?? []) as { start_date: string; end_date: string }[]) {
      let d = new Date(r.start_date + 'T00:00:00');
      const end = new Date(r.end_date + 'T00:00:00');
      while (d < end) {
        blocked.add(iso(d));
        d = new Date(d.getTime() + 86400000);
      }
    }
    return { minStay: v.default_min_stay as number, blocked };
  }));

  const months: ShortStayMonth[] = [];
  for (let i = 0; i < monthsAhead; i++) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

    const counts = nightOptions.map((nights) => {
      let count = 0;
      for (const v of villaBlocked) {
        if (nights < v.minStay) continue;
        let hasWindow = false;
        for (let day = 1; day <= daysInMonth && !hasWindow; day++) {
          const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
          if (start < today) continue;
          let free = true;
          for (let n = 0; n < nights; n++) {
            const check = new Date(start.getTime() + n * 86400000);
            if (v.blocked.has(iso(check))) { free = false; break; }
          }
          if (free) hasWindow = true;
        }
        if (hasWindow) count++;
      }
      return { nights, count };
    });

    months.push({ month: monthDate, counts });
  }
  return months;
}

