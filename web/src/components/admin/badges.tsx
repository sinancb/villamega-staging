import { STATUS_TR, PAYMENT_TR } from '@/lib/format';

const STATUS_STYLE: Record<string, string> = {
  yeni: 'bg-amber-100 text-amber-800',
  iletisimde: 'bg-sky-100 text-sky-800',
  onaylandi: 'bg-emerald-100 text-emerald-800',
  iptal: 'bg-slate-200 text-slate-600',
  tamamlandi: 'bg-pine-900 text-white'
};
const PAYMENT_STYLE: Record<string, string> = {
  yok: 'bg-slate-100 text-slate-600',
  kapora_linki_gonderildi: 'bg-violet-100 text-violet-800',
  kapora_alindi: 'bg-emerald-100 text-emerald-800',
  tamamlandi: 'bg-pine-900 text-white'
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? ''}`}>
      {STATUS_TR[status] ?? status}
    </span>
  );
}
export function PaymentBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PAYMENT_STYLE[status] ?? ''}`}>
      {PAYMENT_TR[status] ?? status}
    </span>
  );
}
