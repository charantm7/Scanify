'use client';

// src/features/menu/components/InlineEdit.tsx
// Redesigned: better pencil hint, smoother editing transition

import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
}

export function InlineEdit({ value, onSave, placeholder = 'Enter name…' }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    const trimmed = val.trim();
    if (!trimmed) {
      setVal(value);
      setEditing(false);
      return;
    }
    if (trimmed !== value) onSave(trimmed);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setVal(value);
            setEditing(false);
          }
        }}
        className="font-bold text-sm bg-transparent outline-none"
        style={{
          color: 'var(--text)',
          borderBottom: '2px solid var(--accent)',
          minWidth: 80,
          maxWidth: 200,
          letterSpacing: '-0.01em',
        }}
      />
    );
  }

  return (
    <button
      onClick={() => {
        setVal(value);
        setEditing(true);
      }}
      className="group/edit inline-flex items-center gap-1.5 font-bold text-sm transition"
      style={{
        color: 'var(--text)',
        letterSpacing: '-0.01em',
        background: 'none',
        border: 'none',
        cursor: 'text',
        padding: 0,
      }}
      title="Click to rename"
    >
      <span>{value || placeholder}</span>
      <Pencil
        size={11}
        className="opacity-0 group-hover/edit:opacity-50 transition flex-shrink-0"
        style={{ color: 'var(--accent)' }}
      />
    </button>
  );
}