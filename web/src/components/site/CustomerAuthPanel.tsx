'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale, Dict } from '@/lib/i18n';
import { supabaseBrowser } from '@/lib/supabase/client';

export function CustomerAuthPanel({ locale, d }: { locale: Locale; d: Dict }) {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setLoading(false);
    if (error) { setError(d.err_generic); return; }
    setStep('code');
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) {
      setError(d.err_otp_invalid);
      setLoading(false);
      return;
    }
    router.push(`/${locale}/hesabim`);
    router.refresh();
  }

  async function resend() {
    setLoading(true); setError(null);
    const supabase = supabaseBrowser();
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col items-center justify-center bg-shell px-4 py-16">
        <div className="mb-8 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark-navy.png" alt="" className="h-8 w-auto" />
          <span className="font-display text-lg font-semibold tracking-[0.14em] text-navy">VILLAMEGA</span>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-navy/10 bg-white p-8 shadow-xl">
          {step === 'email' ? (
            <form onSubmit={sendCode}>
              <h1 className="font-display text-2xl font-semibold text-navy">{d.login_title}</h1>
              <p className="mt-2 text-sm text-navy/60">{d.login_sub}</p>

              <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-navy/60" htmlFor="email">
                {d.login_email_label}
              </label>
              <input id="email" type="email" required autoFocus
                className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/30"
                value={email} onChange={(e) => setEmail(e.target.value)} />

              {error && <p className="mt-4 rounded-md bg-red-50 p-2.5 text-sm text-red-700">{error}</p>}

              <button disabled={loading} type="submit"
                className="mt-6 w-full rounded-full bg-brass py-3 text-sm font-bold uppercase tracking-[0.1em] text-navy transition-colors hover:brightness-105 disabled:opacity-60">
                {loading ? '…' : d.login_continue}
              </button>

              <p className="mt-5 text-center text-xs text-navy/50">{d.login_new_account_note}</p>
            </form>
          ) : (
            <form onSubmit={verifyCode}>
              <h1 className="font-display text-2xl font-semibold text-navy">{d.login_title}</h1>
              <p className="mt-2 text-sm text-navy/60">{d.login_otp_sent}</p>

              <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-navy/60" htmlFor="code">
                {d.login_otp_label}
              </label>
              <input id="code" type="text" inputMode="numeric" autoFocus maxLength={6} required
                className="mt-1 w-full rounded-md border border-navy/20 px-3 py-2.5 text-center text-lg tracking-[0.4em] text-navy focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/30"
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />

              {error && <p className="mt-4 rounded-md bg-red-50 p-2.5 text-sm text-red-700">{error}</p>}

              <button disabled={loading} type="submit"
                className="mt-6 w-full rounded-full bg-brass py-3 text-sm font-bold uppercase tracking-[0.1em] text-navy transition-colors hover:brightness-105 disabled:opacity-60">
                {loading ? '…' : d.login_verify}
              </button>

              <div className="mt-5 flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setStep('email'); setError(null); }} className="text-navy/60 hover:text-navy">
                  {d.login_back}
                </button>
                <button type="button" onClick={resend} disabled={loading} className="font-semibold text-navy hover:underline">
                  {d.login_resend}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="relative hidden overflow-hidden md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero/oludeniz-1.svg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-navy-deep/10 to-transparent" />
        <p className="font-display absolute bottom-14 left-10 right-10 text-2xl font-medium leading-snug text-white [text-shadow:0_2px_18px_rgba(11,21,38,0.45)]">
          {d.login_hero_line}
        </p>
      </div>
    </div>
  );
}
