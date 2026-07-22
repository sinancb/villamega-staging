import Link from 'next/link';
import { redirect } from 'next/navigation';
import { t, REGION_LABEL, type Locale } from '@/lib/i18n';
import { supabaseServer } from '@/lib/supabase/server';

// Reads the auth cookie + the customer's own rows per-request — must never
// be statically cached, or every visitor would see the build-time snapshot.
export const dynamic = 'force-dynamic';

const STATUS_KEY = {
  yeni: 'status_yeni', iletisimde: 'status_iletisimde', onaylandi: 'status_onaylandi',
  iptal: 'status_iptal', tamamlandi: 'status_tamamlandi'
} as const;

export default async function HesabimPage({ params }: { params: { locale: Locale } }) {
  const d = t(params.locale);
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/giris`);

  const [{ data: reservations }, { data: requests }] = await Promise.all([
    supabase
      .from('reservations')
      .select('id, checkin, checkout, status, grand_total, created_at, villas(slug, region, villa_translations(title, locale))')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('villa_requests')
      .select('id, region, checkin, checkout, guest_count, handled, created_at')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
  ]);

  const hasAny = (reservations?.length ?? 0) > 0 || (requests?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-navy">{d.my_account}</h1>
        <form action={`/${params.locale}/cikis`} method="post">
          <button type="submit" className="text-sm font-semibold text-navy/60 hover:text-navy">
            {d.account_logout}
          </button>
        </form>
      </div>

      {!hasAny && (
        <div className="rounded-2xl border border-navy/10 bg-white p-10 text-center shadow-sm">
          <p className="text-navy/70">{d.account_empty}</p>
          <Link href={`/${params.locale}/villalar`} className="mt-4 inline-block text-sm font-semibold text-navy hover:underline">
            {d.all_villas} →
          </Link>
        </div>
      )}

      {(reservations?.length ?? 0) > 0 && (
        <section className="mb-10">
          <h2 className="font-display mb-4 text-xl font-semibold text-navy">{d.account_reservations_title}</h2>
          <div className="space-y-3">
            {reservations!.map((r: any) => {
              const title = r.villas?.villa_translations?.find((vt: any) => vt.locale === params.locale)?.title
                ?? r.villas?.villa_translations?.[0]?.title;
              return (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-navy/10 bg-white p-5 shadow-sm">
                  <div>
                    <div className="font-semibold text-navy">
                      {title ?? (r.villas?.region ? REGION_LABEL[params.locale][r.villas.region] : '—')}
                    </div>
                    <div className="mt-1 text-sm text-navy/60">{r.checkin} → {r.checkout}</div>
                  </div>
                  <span className="rounded-full bg-navy-mist px-3 py-1 text-xs font-semibold text-navy">
                    {d[STATUS_KEY[r.status as keyof typeof STATUS_KEY]]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(requests?.length ?? 0) > 0 && (
        <section>
          <h2 className="font-display mb-4 text-xl font-semibold text-navy">{d.account_requests_title}</h2>
          <div className="space-y-3">
            {requests!.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-navy/10 bg-white p-5 shadow-sm">
                <div>
                  <div className="font-semibold text-navy">
                    {r.region ? REGION_LABEL[params.locale][r.region] : d.search_any_type}
                  </div>
                  <div className="mt-1 text-sm text-navy/60">
                    {r.checkin && r.checkout ? `${r.checkin} → ${r.checkout}` : d.select_dates}
                  </div>
                </div>
                <span className="rounded-full bg-navy-mist px-3 py-1 text-xs font-semibold text-navy">
                  {r.handled ? d.request_handled : d.request_pending}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
