'use client';

// src/features/menu/components/shared/IconPicker.tsx
// Redesigned: cleaner popover, better emoji grid, tooltip

import { useEffect, useRef, useState } from 'react';
import { CATEGORY_ICON_PRESETS } from '../../constants';

export function IconPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Change category icon"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all"
        style={{
          background: 'var(--accent)',
          border: `1.5px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        {value || '🍽️'}
      </button>

      {open && (
        <div
          className="absolute z-30 top-10 left-0 grid grid-cols-5 gap-1 p-2.5 rounded-xl shadow-xl overflow-y-auto max-h-60"
          style={{
            background: 'var(--card)',
            border: '1.5px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 80,
          }}
        >
          <p
            className="col-span-5 text-[10px] font-bold uppercase tracking-wider mb-1 px-0.5"
            style={{ color: 'var(--text2)' }}
          >
            Pick icon
          </p>
          {CATEGORY_ICON_PRESETS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => {
                onChange(icon);
                setOpen(false);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-base"
              style={{ fontSize: 16 }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accentlt)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}