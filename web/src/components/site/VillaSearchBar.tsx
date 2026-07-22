'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n';

export function VillaSearchBar({ locale, placeholder, className }: { locale: Locale; placeholder: string; className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/${locale}/villalar?ara=${encodeURIComponent(query)}` : `/${locale}/villalar`);
  }

  return (
    <form onSubmit={submit}
      className={`flex w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 ${className ?? ''}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent text-xs text-white placeholder:text-white/50 focus:outline-none" />
    </form>
  );
}
