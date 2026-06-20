'use client';

import { Search, LayoutGrid, List, X } from 'lucide-react';
import type { MenuViewMode } from '../types';

interface MenuHeaderProps {
  totalItems: number;
  maxMenuItems: number;
  planLabel: string;
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: MenuViewMode;
  onViewModeChange: (mode: MenuViewMode) => void;
}

export function MenuHeader({
  totalItems,
  maxMenuItems,
  planLabel,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: MenuHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Top row: title + plan badge */}
      <div className="hidden md:flex sm:flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1
              className="font-bold text-xl leading-tight"
              style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}
            >
              Menu Builder
            </h1>
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text2)' }}>
              <span style={{ color: 'var(--accent)' }}>{totalItems}</span>
              {' '}item{totalItems !== 1 ? 's' : ''} ·{' '}
              {maxMenuItems === -1
                ? 'Unlimited'
                : `${totalItems} / ${maxMenuItems} slots used`}
            </p>
          </div>
        </div>

        {/* Plan badge */}
        <span
          className="flex-shrink-0  inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
          style={{ background: 'var(--accentlt)', color: 'var(--accent)' }}
        >
          {planLabel}
        </span>
      </div>

      {/* Bottom row: search + view toggle */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text2)' }}
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items or categories…"
            className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              border: '1.5px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: '13px',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--accentlt)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition"
              style={{ background: 'var(--border)', color: 'var(--text2)' }}
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div
          className="flex items-center rounded-xl p-1 flex-shrink-0 gap-0.5"
          style={{ background: 'var(--accentlt)', border: '1.5px solid var(--border)' }}
        >
          {(['list', 'grid'] as MenuViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: viewMode === mode ? 'var(--card)' : 'transparent',
                color: viewMode === mode ? 'var(--accent)' : 'var(--text2)',
                boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
              title={`${mode === 'list' ? 'List' : 'Grid'} view`}
            >
              {mode === 'list' ? <List size={14} /> : <LayoutGrid size={14} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}