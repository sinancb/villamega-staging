'use client';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    params.get('err') === 'yetki' ? 'Bu hesabın yönetim paneline erişim yetkisi yok.' : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('E-posta veya şifre hatalı.');
      setLoading(false);
      return;
    }
    router.push('/admin/talepler');
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-4">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#2E6E8E_0%,#16294D_55%,#0B1526_100%)]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-mark-white.png" alt="" className="h-12 w-auto" />
          <div className="mt-4 font-display text-2xl font-semibold tracking-[0.15em] text-white">VILLAMEGA</div>
          <div className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-brass-soft">Ekip Girişi</div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
          <div className="mb-5">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60" htmlFor="email">E-posta</label>
            <input id="email" type="email" required
              className="w-full rounded-md border border-navy/20 px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/30"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60" htmlFor="password">Şifre</label>
            <input id="password" type="password" required
              className="w-full rounded-md border border-navy/20 px-3 py-2.5 text-sm text-navy focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy/30"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="mb-5 rounded-md bg-red-50 p-2.5 text-sm text-red-700">{error}</p>}
          <button disabled={loading}
            className="w-full rounded-full bg-brass py-3 text-sm font-bold uppercase tracking-[0.1em] text-navy transition-colors hover:brightness-105 disabled:opacity-60">
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
