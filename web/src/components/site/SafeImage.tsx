'use client';

import { useState } from 'react';
import Image from 'next/image';

export function SafeImage({ src, fallback, alt, className, sizes = '100vw', priority = false, fill = true }: {
  src: string; fallback: string; alt: string; className?: string;
  sizes?: string; priority?: boolean; fill?: boolean;
}) {
  const [current, setCurrent] = useState(src);
  return (
    <Image
      src={current}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
