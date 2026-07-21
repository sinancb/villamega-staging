'use client';
import { useRef, useState, useTransition } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { registerPhoto, savePhotoOrder, deletePhoto } from '@/app/admin/villalar/actions';
import { compressImage } from '@/lib/image-compress';
import type { VillaPhoto } from '@/lib/types';

// Raw input sanity cap — actual stored size is tiny after compression,
// this just guards against pathological uploads.
const MAX_SOURCE_MB = 40;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export function PhotoManager({ villaId, slug, photos }: {
  villaId: string; slug: string; photos: VillaPhoto[];
}) {
  const [items, setItems] = useState(photos);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [dragOverDrop, setDragOverDrop] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const publicUrl = (path: string) =>
    supabaseBrowser().storage.from('villas').getPublicUrl(path).data.publicUrl;

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true); setMessage(null);
    const supabase = supabaseBrowser();

    for (const file of files) {
      if (!ACCEPTED.includes(file.type)) {
        setMessage({ ok: false, text: `${file.name}: desteklenmeyen dosya türü.` });
        continue;
      }
      if (file.size > MAX_SOURCE_MB * 1024 * 1024) {
        setMessage({ ok: false, text: `${file.name}: dosya ${MAX_SOURCE_MB} MB sınırını aşıyor.` });
        continue;
      }

      let blob: Blob; let ext: string;
      try {
        const compressed = await compressImage(file);
        blob = compressed.blob; ext = compressed.ext;
      } catch {
        setMessage({ ok: false, text: `${file.name}: optimize edilemedi, orijinal dosya yükleniyor.` });
        blob = file; ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      }

      const path = `villas/${slug}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('villas').upload(path, blob, {
        cacheControl: '31536000', upsert: false, contentType: blob.type || undefined
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
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    uploadFiles(Array.from(e.target.files ?? []));
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOverDrop(false);
    uploadFiles(Array.from(e.dataTransfer.files ?? []));
  }

  function persistOrder(next: VillaPhoto[]) {
    setItems(next);
    startTransition(async () => {
      const result = await savePhotoOrder(villaId, next.map((p) => p.id));
      if (!result.ok) setMessage({ ok: false, text: result.error ?? 'Sıralama kaydedilemedi.' });
    });
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persistOrder(next);
  }

  function onThumbDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    setOverIndex(null);
    if (from === null || from === index) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    persistOrder(next);
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
          <figure
            key={photo.id}
            draggable
            onDragStart={() => { dragIndex.current = i; }}
            onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
            onDragLeave={() => setOverIndex((cur) => (cur === i ? null : cur))}
            onDrop={() => onThumbDrop(i)}
            onDragEnd={() => { dragIndex.current = null; setOverIndex(null); }}
            className={[
              'group relative cursor-grab overflow-hidden rounded-lg border bg-white transition-shadow active:cursor-grabbing',
              overIndex === i ? 'border-aegean-500 ring-2 ring-aegean-500/40' : 'border-slate-200'
            ].join(' ')}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publicUrl(photo.storage_path)} alt={photo.alt_text ?? ''}
              className="aspect-[4/3] w-full select-none object-cover" draggable={false} />
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

      <label
        onDragOver={(e) => { e.preventDefault(); setDragOverDrop(true); }}
        onDragLeave={() => setDragOverDrop(false)}
        onDrop={handleDrop}
        className={[
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragOverDrop ? 'border-aegean-500 bg-aegean-100' : 'border-slate-300 hover:border-slate-400'
        ].join(' ')}
      >
        <span className="text-sm font-medium text-pine-900">
          {uploading ? 'Optimize ediliyor ve yükleniyor…' : 'Fotoğrafları buraya sürükleyin veya tıklayıp seçin'}
        </span>
        <span className="mt-1 text-xs text-slate-500">
          JPEG, PNG veya WebP · dosya boyutu ne olursa olsun otomatik optimize edilir ·
          ilk fotoğraf sitede kapak olarak kullanılır.
        </span>
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
          onChange={handleInputChange} disabled={uploading} />
      </label>
      {message && (
        <p className={`mt-2 text-sm ${message.ok ? 'text-emerald-700' : 'text-red-600'}`}>{message.text}</p>
      )}
    </div>
  );
}
