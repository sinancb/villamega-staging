import { supabaseServer } from '@/lib/supabase/server';

export async function fetchActiveVillas(region?: string, minCapacity?: number) {
  const supabase = supabaseServer();
  let query = supabase
    .from('villas')
    .select('*, villa_translations(*), villa_photos(storage_path, sort_order), price_seasons(start_date, end_date, nightly_price)')
    .eq('status', 'active')
    .order('created_at', { ascending: true });
  if (region) query = query.eq('region', region);
  if (minCapacity) query = query.gte('capacity', minCapacity);
  const { data } = await query;
  return data ?? [];
}

export function coverUrl(villa: any, index = 0): string {
  const photos = [...(villa.villa_photos ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  if (photos.length > 0) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${base}/storage/v1/object/public/villas/${photos[0].storage_path}`;
  }
  return `/placeholders/villa-${index % 3}.svg`;
}

export function todayNightly(villa: any): number | null {
  const today = new Date().toISOString().slice(0, 10);
  const season = (villa.price_seasons ?? []).find(
    (s: any) => s.start_date <= today && today <= s.end_date
  );
  if (season) return Number(season.nightly_price);
  // Off-season: show the cheapest upcoming band instead of nothing
  const upcoming = (villa.price_seasons ?? [])
    .filter((s: any) => s.start_date > today)
    .sort((a: any, b: any) => Number(a.nightly_price) - Number(b.nightly_price));
  return upcoming.length ? Number(upcoming[0].nightly_price) : null;
}
