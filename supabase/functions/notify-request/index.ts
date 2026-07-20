// Supabase Edge Function: notify-request
// Wire-up: Dashboard → Database → Webhooks → on INSERT into `reservations`
// (fires for every new record; we only mail for status 'yeni' / source 'site').
// Secrets: RESEND_API_KEY, NOTIFY_TO (team inbox), NOTIFY_FROM (verified sender).

Deno.serve(async (req) => {
  const payload = await req.json();
  const r = payload.record;

  if (!r || r.status !== 'yeni' || r.source !== 'site') {
    return new Response('skip', { status: 200 });
  }

  const fmt = (n: number) => '₺' + new Intl.NumberFormat('tr-TR').format(n);
  const html = `
    <h2>Yeni rezervasyon talebi</h2>
    <p><strong>${r.guest_first_name} ${r.guest_last_name}</strong> — <a href="tel:${r.guest_phone}">${r.guest_phone}</a></p>
    <p>${r.checkin} → ${r.checkout} (${r.nights} gece)</p>
    <p>Konaklama: ${fmt(r.accommodation_total)} · Temizlik: ${fmt(r.cleaning_fee)} · <strong>Toplam: ${fmt(r.grand_total)}</strong></p>
    <p><a href="${Deno.env.get('SITE_URL') ?? ''}/admin/talepler/${r.id}">Panelde aç</a></p>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: Deno.env.get('NOTIFY_FROM'),
      to: [Deno.env.get('NOTIFY_TO')],
      subject: `Yeni talep: ${r.guest_first_name} ${r.guest_last_name} · ${r.checkin}`,
      html
    })
  });

  return new Response(resp.ok ? 'sent' : 'resend-error', { status: resp.ok ? 200 : 500 });
});
