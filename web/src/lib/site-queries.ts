import { supabaseServer } from '@/lib/supabase/server';
import type { Locale } from '@/lib/i18n';

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

