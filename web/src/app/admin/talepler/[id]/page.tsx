import { supabaseServer } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { tl, trDate, STATUS_TR, PAYMENT_TR } from '@/lib/format';
import { StatusBadge, PaymentBadge } from '@/components/admin/badges';
import { ReservationForm } from '@/components/admin/ReservationForm';
import Link from 'next/link';

export default async function ReservationDetail({ params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: r } = await supabase
    .from('reservations')
    .select('*, villas(id, slug, cleaning_fee, deposit_amount, prepayment_pct, villa_translations(title, locale))')
    .eq('id', params.id)
    .single();

  if (!r) notFound();

  const title =
    r.villas?.villa_translations?.find((t: any) => t.locale === 'tr')?.title ?? r.villas?.slug;
  const prepayment = Math.round((r.accommodation_total * (r.villas?.prepayment_pct ?? 20)) / 100);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/talepler" className="text-sm text-aegean-600 hover:underline">← Rezervasyonlar</Link>
      <div className="mb-6 mt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pine-900">
            {r.guest_first_name} {r.guest_last_name}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            <a className="text-aegean-600 hover:underline" href={`tel:${r.guest_phone}`}>{r.guest_phone}</a>
            {' · '}{title}{' · '}{trDate(r.checkin)} → {trDate(r.checkout)} ({r.nights} gece)
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={r.status} />
          <PaymentBadge status={r.payment_status} />
        </div>
      </div>

      <div className="card mb-6 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Fiyat dökümü</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>Konaklama tutarı ({r.nights} gece)</dt><dd>{tl(r.accommodation_total)}</dd></div>
          <div className="flex justify-between"><dt>Temizlik ücreti</dt><dd>{tl(r.cleaning_fee)}</dd></div>
          <div className="flex justify-between text-slate-500"><dt>Ön ödeme (%{r.villas?.prepayment_pct})</dt><dd>{tl(prepayment)}</dd></div>
          <div className="flex justify-between text-slate-500"><dt>Girişte kalan</dt><dd>{tl(r.grand_total - prepayment)}</dd></div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold"><dt>Toplam</dt><dd>{tl(r.grand_total)}</dd></div>
          <div className="flex justify-between text-slate-500"><dt>Hasar depozitosu (girişte, iade edilir)</dt><dd>{tl(r.villas?.deposit_amount ?? 0)}</dd></div>
        </dl>
      </div>

      <ReservationForm
        id={r.id}
        status={r.status}
        paymentStatus={r.payment_status}
        notes={r.notes ?? ''}
        statusOptions={STATUS_TR}
        paymentOptions={PAYMENT_TR}
      />
    </div>
  );
}
