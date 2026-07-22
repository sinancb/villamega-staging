'use client';

import { useEffect, useState } from 'react';

const SLIDE_MS = 6500;
const SOURCES = ['/hero/oludeniz-1.svg', '/hero/oludeniz-2.svg', '/hero/oludeniz-3.svg'];

export function HeroSlider({ slides, showCaption = true }: { slides: { tag: string; caption: string }[]; showCaption?: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SOURCES.map((src, i) => (
        <div key={src} className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${i === index ? 'opacity-100' : 'opacity-0'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={slides[i]?.tag ?? ''}
            className={`h-full w-full object-cover ${i === index ? 'animate-hero-zoom' : ''}`}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/40 via-navy-deep/10 to-navy-deep/80" />

      {showCaption && (
        <>
          <div className="absolute bottom-20 left-4 md:bottom-24 md:left-10">
            <div className="mb-2 h-px w-10 bg-brass-soft/70" />
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-brass-soft">
              {slides[index]?.tag}
            </div>
            <div className="font-display mt-1 text-lg italic text-white/90">{slides[index]?.caption}</div>
          </div>

          <div className="absolute bottom-[5.25rem] right-4 flex gap-2 md:bottom-24 md:right-10">
            {SOURCES.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className="relative h-[3px] w-9 overflow-hidden rounded-full bg-white/25"
              >
                {i === index && (
                  <span key={`${index}-${paused}`} className="absolute inset-y-0 left-0 animate-hero-progress bg-brass"
                    style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }} />
                )}
                {i < index && <span className="absolute inset-0 bg-brass/70" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
