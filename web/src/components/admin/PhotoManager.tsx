'use client';
import { useState, useTransition } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { registerPhoto, savePhotoOrder, deletePhoto } from '@/app/admin/villalar/actions';
import type { VillaPhoto } from '@/lib/types';

const MAX_MB = 8;

export function PhotoManager({ villaId, slug, photos }: {
  villaId: string; slug: string; photos: VillaPhoto[];
}) {
  const [items, setItems] = useState(photos);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const publicUrl = (path: string) =>
    supabaseBrowser().storage.from('villas').getPublicUrl(path).data.publicUrl;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true); setMessage(null);
    const supabase = supabaseBrowser();

    for (const file of files) {
      if (file.size > MAX_MB * 1024 * 1024) {
        setMessage({ ok: false, text: `${file.name}: dosya ${MAX_MB} MB sınırını aşıyor.` });
        continue;
      }
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      const path = `villas/${slug}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('villas').upload(path, file, {
        cacheControl: '31536000', upsert: false
      });
      if (error) {
        setMessage({ ok: false, text: `${file.name}: yüklenemedi (${error.message}).` });
        continue;
      }
      const result = await registerPhoto(villaId, path, items.length);
      if (result.ok) {
        setItems((prev) => [...prev, {
          id: crypto.randomUUID(), villa_id: villaId, storage_path: path,
          alt_text: null, sort_order: prev.length
        }]);
      }
    }
    setUploading(false);
    e.target.value = '';
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    startTransition(async () => {
      const result = await savePhotoOrder(villaId, next.map((p) => p.id));
      if (!result.ok) setMessage({ ok: false, text: result.error ?? 'Sıralama kaydedilemedi.' });
    });
  }

  function remove(photo: VillaPhoto) {
    const fd = new FormData();
    fd.set('id', photo.id);
    fd.set('storage_path', photo.storage_path);
    fd.set('villa_id', villaId);
    startTransition(async () => {
      const result = await deletePhoto(fd);
      if (result.ok) setItems((prev) => prev.filter((p) => p.id !== photo.id));
      else setMessage({ ok: false, text: result.error ?? 'Silinemedi.' });
    });
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((photo, i) => (
          <figure key={photo.id} className="group relative overflow-hidden rounded-lg border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publicUrl(photo.storage_path)} alt={photo.alt_text ?? ''}
              className="aspect-[4/3] w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded bg-pine-900/90 px-2 py-0.5 text-xs text-white">
                Kapak
              </span>
            )}
            <figcaption className="flex items-center justify-between bg-white px-2 py-1.5 text-xs">
              <span className="flex gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0 || pending}
                  className="rounded px-1.5 py-0.5 hover:bg-slate-100 disabled:opacity-30" aria-label="Öne al">←</button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1 || pending}
                  className="rounded px-1.5 py-0.5 hover:bg-slate-100 disabled:opacity-30" aria-label="Geriye al">→</button>
              </span>
              <button onClick={() => remove(photo)} disabled={pending}
                className="text-red-600 hover:underline">Sil</button>
            </figcaption>
          </figure>
        ))}
      </div>

      <label className="btn-ghost cursor-pointer">
        {uploading ? 'Yükleniyor…' : 'Fotoğraf yükle'}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
          onChange={handleUpload} disabled={uploading} />
      </label>
      <p className="mt-2 text-xs text-slate-500">
        JPEG, PNG veya WebP · en fazla {MAX_MB} MB · ilk fotoğraf sitede kapak olarak kullanılır.
      </p>
      {message && (
        <p className={`mt-2 text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>
      )}
    </div>
  );
}
