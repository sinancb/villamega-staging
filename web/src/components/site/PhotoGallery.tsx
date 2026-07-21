'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SafeImage } from '@/components/site/SafeImage';
import { placeholderFor } from '@/lib/villa-display';

export function PhotoGallery({ photos, alt, morePhotosLabel, closeLabel }: {
  photos: string[]; alt: string; morePhotosLabel: string; closeLabel: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const remaining = photos.length - 3;
  const touchX = useRef<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => setOpenIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)), [photos.length]);
  const next = useCallback(() => setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length)), [photos.length]);

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, prev, next]);

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 50) prev();
    else if (dx < -50) next();
    touchX.current = null;
  }

  return (
    <>
      <div className="grid gap-3 md:grid-cols-3">
        <button type="button" onClick={() => setOpenIndex(0)}
          className="col-span-2 block overflow-hidden rounded-t-arch rounded-b-2xl">
          <SafeImage src={photos[0]} fallback={placeholderFor(0)} alt={alt}
            className="aspect-[3/2] w-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
        </button>
        <div className="grid gap-3">
          {photos.slice(1, 3).map((url, i) => {
            const index = i + 1;
            const showOverlay = index === 2 && remaining > 0;
            return (
              <button key={index} type="button" onClick={() => setOpenIndex(index)}
                className="relative block overflow-hidden rounded-2xl">
                <SafeImage src={url} fallback={placeholderFor(index)} alt=""
                  className="aspect-[3/2] w-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
                {showOverlay && (
                  <span className="absolute inset-0 flex items-center justify-center bg-navy-deep/55 text-center font-display text-lg font-semibold text-white">
                    {remaining}+ {morePhotosLabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/95 p-4"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button type="button" onClick={close} aria-label={closeLabel}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>

          <span className="absolute left-4 top-4 text-sm font-medium text-white/70">
            {openIndex + 1} / {photos.length}
          </span>

          <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Önceki"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10 md:left-6">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[openIndex]}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { e.currentTarget.src = placeholderFor(openIndex); }}
            className="max-h-[85vh] max-w-[92vw] select-none rounded-lg object-contain md:max-w-[80vw]"
          />

          <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Sonraki"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/10 md:right-6">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
