'use client';

// A free-text list field — used for an item's ingredients and allergens.
//
// Entries are added with Enter or comma rather than a fixed dropdown, because
// no preset list survives contact with real menus: every kitchen has its own
// ingredients, and allergen wording varies by region.

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ListInputProps {
  label: string;
  placeholder?: string;
  values: string[];
  disabled?: boolean;
  /** Guards against an owner pasting an essay into a menu chip. */
  maxEntries?: number;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}

export function ListInput({
  label,
  placeholder,
  values,
  disabled,
  maxEntries = 30,
  onAdd,
  onRemove,
}: ListInputProps) {
  const [draft, setDraft] = useState('');

  const atLimit = values.length >= maxEntries;

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed || atLimit) return;
    onAdd(trimmed);
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Comma commits too, so pasting "paneer, cream, butter" and typing commas
    // both behave the way the chips suggest.
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
      return;
    }
    // Backspace on an empty field removes the last chip, which is the standard
    // behaviour for this kind of input.
    if (e.key === 'Backspace' && !draft && values.length) {
      onRemove(values[values.length - 1]!);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>
        {label}
      </p>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg text-xs font-medium"
              style={{ background: 'var(--accentlt)', color: 'var(--accent)' }}
            >
              {value}
              <button
                type="button"
                onClick={() => onRemove(value)}
                disabled={disabled}
                aria-label={`Remove ${value}`}
                className="w-4 h-4 rounded flex items-center justify-center hover:opacity-70 disabled:opacity-40"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={atLimit ? `Up to ${maxEntries}` : placeholder}
          disabled={disabled || atLimit}
          maxLength={40}
          className="flex-1 min-w-0 px-3 py-2 rounded-xl text-sm outline-none disabled:opacity-50"
          style={{
            border: '1.5px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--text)',
            fontSize: '13px',
          }}
        />
        <button
          type="button"
          onClick={commit}
          disabled={disabled || atLimit || !draft.trim()}
          aria-label={`Add to ${label}`}
          className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ border: '1.5px solid var(--border)', color: 'var(--text2)' }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
