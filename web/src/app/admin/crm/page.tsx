import { supabaseServer } from '@/lib/supabase/server';
import { trDate, tl, STATUS_TR } from '@/lib/format';

type CustomerEntry = {
  phone: string; name: string; lastContact: string;
  reservations: { title: string; checkin: string; checkout: string; total: number; status: string }[];
  requestCount: number;
};

function normalizePhone(p: string) {
  return p.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '');
}

export default async function CrmPage() {
  const supabase = supabaseServer();
  const [{ data: reservations, error: resError }, { data: requests, error: reqError }] = await Promise.all([
    supabase.from('reservations')
      .select('guest_first_name, guest_last_name, guest_phone, checkin, checkout, grand_total, status, created_at, villas(slug, villa_translations(title, locale))')
      .order('created_at', { ascending: false }),
    supabase.from('villa_requests')
      .select('first_name, last_name, phone, created_at')
      .order('created_at', { ascending: false })
  ]);

  const map = new Map<string, CustomerEntry>();

  for (const r of (reservations ?? []) as any[]) {
    const key = normalizePhone(r.guest_phone);
    if (!key) continue;
    const title = r.villas?.villa_translations?.find((t: any) => t.locale === 'tr')?.title ?? r.villas?.slug ?? '—';
    const entry: CustomerEntry = map.get(key) ?? { phone: r.guest_phone, name: `${r.guest_first_name} ${r.guest_last_name}`, lastContact: r.created_at, reservations: [], requestCount: 0 };
    entry.reservations.push({ title, checkin: r.checkin, checkout: r.checkout, total: Number(r.grand_total), status: r.status });
    if (r.created_at > entry.lastContact) {
      entry.lastContact = r.created_at;
      entry.name = `${r.guest_first_name} ${r.guest_last_name}`;
      entry.phone = r.guest_phone;
    }
    map.set(key, entry);
  }

  for (const req of (requests ?? []) as any[]) {
    const key = normalizePhone(req.phone);
    if (!key) continue;
    const entry: CustomerEntry = map.get(key) ?? { phone: req.phone, name: `${req.first_name} ${req.last_name}`, lastContact: req.created_at, reservations: [], requestCount: 0 };
    entry.requestCount += 1;
    if (req.created_at > entry.lastContact) {
      entry.lastContact = req.created_at;
      entry.name = `${req.first_name} ${req.last_name}`;
      entry.phone = req.phone;
    }
    map.set(key, entry);
  }

  const customers = [...map.values()].sort((a, b) => b.lastContact.localeCompare(a.lastContact));
  const error = resError ?? reqError;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-pine-900">CRM — Müşteri İlişkileri</h1>
      <p className="mb-6 text-sm text-slate-500">
        Rezervasyon ve villa talebi kayıtlarından telefon numarasına göre birleştirilmiş müşteri listesi.
      </p>

      {error && (
        <p className="text-sm text-red-600">
          Kayıtlar yüklenemedi: {error.message}. Migration 009_villa_finder.sql çalıştırıldı mı?
        </p>
      )}

      {!error && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">Müşteri</th>
                <th className="th">Rezervasyonlar</th>
                <th className="th">Villa Talebi</th>
                <th className="th">Son Temas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.phone} className="align-top hover:bg-aegean-100/40">
                  <td className="td">
                    <div className="font-medium text-pine-900">{c.name}</div>
                    <a href={`tel:${c.phone}`} className="text-xs text-aegean-600 hover:underline">{c.phone}</a>
                  </td>
                  <td className="td">
                    {c.reservations.length === 0 ? <span className="text-slate-400">—</span> : (
                      <ul className="space-y-1 text-xs text-slate-600">
                        {c.reservations.map((r, i) => (
                          <li key={i}>{r.title} · {trDate(r.checkin)}–{trDate(r.checkout)} · {tl(r.total)} · {STATUS_TR[r.status] ?? r.status}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="td text-sm text-slate-600">{c.requestCount || <span className="text-slate-400">—</span>}</td>
                  <td className="td text-xs text-slate-500">{trDate(c.lastContact)}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td className="td py-10 text-center text-slate-500" colSpan={4}>Henüz kayıt yok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
