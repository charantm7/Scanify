'use client';

// src/features/menu/components/CategoryCreateBar.tsx
// Redesigned: more prominent create area with clear call-to-action

import { useState } from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import { Button } from '../../../components/shared/ui';
import { IconPicker } from './shared/IconPicker';

interface CategoryCreateBarProps {
  disabled?: boolean;
  loading?: boolean;
  onCreate: (name: string, icon: string | null) => void;
}

export function CategoryCreateBar({ disabled, loading, onCreate }: CategoryCreateBarProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, icon);
    setName('');
    setIcon(null);
  }

  return (
    <div
      className="rounded-2xl p-3 transition-all"
      style={{
        border: `1.5px ${focused ? 'solid' : 'dashed'} ${focused ? 'var(--accent)' : 'var(--border)'}`,
        background: 'var(--card)',
        boxShadow: focused ? '0 0 0 3px var(--accentlt)' : 'none',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Icon picker */}
        <IconPicker value={icon} onChange={setIcon} />

        {/* Input */}
        <div className="flex-1 flex items-center gap-2">

          <input
            placeholder="Create new category"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 bg-transparent outline-none text-sm font-medium"
            style={{
              color: 'var(--text)',
              fontSize: '13px',
            }}
            disabled={disabled}
          />
        </div>

        {/* Add button */}
        <Button
          disabled={disabled || !name.trim()}
          loading={loading}
          onClick={submit}
          className=" py-2 px-0"
        >
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}