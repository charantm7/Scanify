// src/features/menu/components/shared/DietaryDot.tsx
// Redesigned: slightly larger, cleaner indicator

import { DIETARY_META } from '../../constants';
import type { DietaryType } from '../../types';

export function DietaryDot({ type, size = 13 }: { type: DietaryType; size?: number }) {
  const meta = DIETARY_META[type];
  return (
    <span
      title={meta.label}
      className="inline-flex items-center justify-center rounded-sm border flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderColor: meta.ring,
        borderWidth: 1.5,
        padding: 2,
      }}
    >
      <span
        className="block rounded-full"
        style={{ width: '55%', height: '55%', background: meta.dot }}
      />
    </span>
  );
}