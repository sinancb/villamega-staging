'use client';
import { useState, type ReactNode } from 'react';

export type Tab = { key: string; label: string; badge?: number; content: ReactNode };

export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={[
              'flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              active === t.key
                ? 'border-aegean-600 text-aegean-600'
                : 'border-transparent text-slate-500 hover:text-pine-900'
            ].join(' ')}
          >
            {t.label}
            {t.badge != null && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="pt-6">
        {tabs.find((t) => t.key === active)?.content}
      </div>
    </div>
  );
}
