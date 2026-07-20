'use client';
import { useState, useTransition } from 'react';
import { updateReservation } from '@/app/admin/talepler/actions';

export function ReservationForm(props: {
  id: string; status: string; paymentStatus: string; notes: string;
  statusOptions: Record<string, string>; paymentOptions: Record<string, string>;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateReservation(formData);
      setMessage(result.ok
        ? { ok: true, text: 'Kaydedildi.' }
        : { ok: false, text: result.error ?? 'Kaydedilemedi.' });
    });
  }

  return (
    <form action={handleSubmit} className="card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Durum yönetimi</h2>
      <input type="hidden" name="id" value={props.id} />
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="status">Rezervasyon durumu</label>
          <select id="status" name="status" defaultValue={props.status} className="input">
            {Object.entries(props.statusOptions).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="payment_status">Ödeme durumu</label>
          <select id="payment_status" name="payment_status" defaultValue={props.paymentStatus} className="input">
            {Object.entries(props.paymentOptions).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>
      <label className="label" htmlFor="notes">Notlar</label>
      <textarea id="notes" name="notes" rows={3} defaultValue={props.notes} className="input mb-4"
        placeholder="Örn: Kapora linki WhatsApp'tan gönderildi, Perşembe arayacaklar." />
      {message && (
        <p className={`mb-3 text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>
      )}
      <button disabled={pending} className="btn-primary">
        {pending ? 'Kaydediliyor…' : 'Kaydet'}
      </button>
    </form>
  );
}
