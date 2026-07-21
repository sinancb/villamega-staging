// Supabase Edge Function: notify-villa-request
// Wire-up: Dashboard → Database → Webhooks → on INSERT into `villa_requests`
// Secrets: reuses RESEND_API_KEY, NOTIFY_TO, NOTIFY_FROM, SITE_URL from
// notify-request. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected
// automatically into every Edge Function.

const REGION_TR: Record<string, string> = { fethiye: 'Fethiye', kas: 'Kaş', kalkan: 'Kalkan' };

Deno.serve(async (req) => {
  const payload = await req.json();
  const r = payload.record;
  if (!r) return new Response('skip', { status: 200 });

  let categoryLabel: string | null = null;
  if (r.category_id) {
    const resp = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/category_translations?category_id=eq.${r.category_id}&locale=eq.tr&select=label`,
      { headers: {
        apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      } }
    );
    const rows = await resp.json().catch(() => []);
    categoryLabel = rows?.[0]?.label ?? null;
  }

  const criteria = [
    r.region ? REGION_TR[r.region] ?? r.region : null,
    categoryLabel,
    r.checkin && r.checkout ? `${r.checkin} → ${r.checkout}` : null,
    r.guest_count ? `${r.guest_count} misafir` : null
  ].filter(Boolean).join(' · ') || 'Kriter belirtilmedi';

  const html = `
    <h2>Yeni villa bulma talebi</h2>
    <p><strong>${r.first_name} ${r.last_name}</strong> — <a href="tel:${r.phone}">${r.phone}</a></p>
    <p>${criteria}</p>
    <p><a href="${Deno.env.get('SITE_URL') ?? ''}/admin/villa-talepleri">Panelde aç</a></p>`;

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: Deno.env.get('NOTIFY_FROM'),
      to: [Deno.env.get('NOTIFY_TO')],
      subject: `Villa bulma talebi: ${r.first_name} ${r.last_name}`,
      html
    })
  });

  return new Response(resp.ok ? 'sent' : 'resend-error', { status: resp.ok ? 200 : 500 });
});
