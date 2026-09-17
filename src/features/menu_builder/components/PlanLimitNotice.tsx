'use client';

// src/features/menu_builder/components/PlanLimitNotice.tsx
//
// Shown when a plan downgrade has taken content out of service. Its job is to
// explain a state the owner did not choose, so it says three things
// explicitly: how many items are affected, that nothing was deleted, and what
// they can do about it right now (re-pick, or upgrade).

import { Lock, ArrowUpRight } from 'lucide-react';

interface PlanLimitNoticeProps {
  /** Items in the selected menu currently withheld by the plan. */
  hiddenItemCount: number;
  /** Menus across the hotel parked by the plan. */
  parkedMenuCount: number;
  maxMenuItems: number;
  planLabel: string;
  onUpgrade: () => void;
}

export function PlanLimitNotice({
  hiddenItemCount,
  parkedMenuCount,
  maxMenuItems,
  planLabel,
  onUpgrade,
}: PlanLimitNoticeProps) {
  if (hiddenItemCount === 0 && parkedMenuCount === 0) return null;

  const parts: string[] = [];
  if (hiddenItemCount > 0) {
    parts.push(`${hiddenItemCount} item${hiddenItemCount === 1 ? '' : 's'}`);
  }
  if (parkedMenuCount > 0) {
    parts.push(`${parkedMenuCount} menu${parkedMenuCount === 1 ? '' : 's'}`);
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--accentlt)', border: '1.5px solid var(--border)' }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Lock size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
          <div className="min-w-0">
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
              {parts.join(' and ')} hidden by your {planLabel} plan
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text2)' }}>
              {maxMenuItems === -1
                ? 'Nothing has been deleted.'
                : `Your plan shows ${maxMenuItems} items at a time. Nothing has been deleted — `}
              {hiddenItemCount > 0 && (
                <>
                  use the{' '}
                  <Lock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                  button on any item to choose which ones diners see.{' '}
                </>
              )}
              {parkedMenuCount > 0 && 'Paused menus can be swapped in above. '}
              Everything comes back the moment you upgrade.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onUpgrade}
          className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          See plans <ArrowUpRight size={13} />
        </button>
      </div>
    </div>
  );
}
