// src/features/menu/components/shared/TagBadge.tsx
// Redesigned: cleaner pill badge

import { TAG_META, SPICE_LEVEL_META } from '../../constants';
import type { ItemTag, SpiceLevel } from '../../types';

export function TagBadge({ tag }: { tag: ItemTag }) {
  const meta = TAG_META[tag];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{
        background: 'var(--accentlt)',
        color: 'var(--accent)',
        letterSpacing: '0.01em',
      }}
    >
      <span style={{ fontSize: 10 }}>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}


export function SpiceBadge({ tag }: { tag: SpiceLevel }) {
  const meta = SPICE_LEVEL_META[tag];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{
        background: 'var(--accentlt)',
        color: 'var(--accent)',
        letterSpacing: '0.01em',
      }}
    >
      <span>spice: </span>
      <span style={{ fontSize: 10 }}>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}