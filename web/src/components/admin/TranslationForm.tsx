'use client';
import { useState, useTransition } from 'react';
import { upsertTranslation } from '@/app/admin/villalar/actions';
import type { VillaTranslation, Locale } from '@/lib/types';

export function TranslationForm({ villaId, locale, translation }: {
  villaId: string; locale: Locale; translation?: VillaTranslation;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      const result = await upsertTranslation(fd);
      setMessage(result.ok ? 'Kaydedildi.' : result.error ?? 'Kaydedilemedi.');
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <input type="hidden" name="villa_id" value={villaId} />
      <input type="hidden" name="locale" value={locale} />
      <div>
        <label className="label" htmlFor={`title-${locale}`}>Başlık</label>
        <input id={`title-${locale}`} name="title" required defaultValue={translation?.title ?? ''} className="input" />
      </div>
      <div>
        <label className="label" htmlFor={`description-${locale}`}>Açıklama</label>
        <textarea id={`description-${locale}`} name="description" rows={5}
          defaultValue={translation?.description ?? ''} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor={`seo_title-${locale}`}>SEO başlığı</label>
          <input id={`seo_title-${locale}`} name="seo_title" defaultValue={translation?.seo_title ?? ''} className="input" />
        </div>
        <div>
          <label className="label" htmlFor={`seo_desc-${locale}`}>SEO açıklaması</label>
          <input id={`seo_desc-${locale}`} name="seo_desc" defaultValue={translation?.seo_desc ?? ''} className="input" />
        </div>
      </div>
      {message && <p className="text-sm text-slate-600">{message}</p>}
      <button disabled={pending} className="btn-ghost">{pending ? 'Kaydediliyor…' : `${locale.toUpperCase()} içeriğini kaydet`}</button>
    </form>
  );
}
