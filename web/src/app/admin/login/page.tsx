'use client';
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
    <div className="flex min-h-screen items-center justify-center bg-pine-900">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl">
        <h1 className="text-xl font-semibold text-pine-900">Villa Yönetim</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">Ekip girişi</p>
        <label className="label" htmlFor="email">E-posta</label>
        <input id="email" type="email" required className="input mb-4"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="label" htmlFor="password">Şifre</label>
        <input id="password" type="password" required className="input mb-6"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="btn-primary w-full justify-center">
          {loading ? 'Giriş yapılıyor…' : 'Giriş yap'}
        </button>
      </form>
    </div>
  );
}
