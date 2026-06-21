'use client';

// src/features/menu/components/ItemRow.tsx — list-view row
// Redesigned: better spacing, mobile-friendly actions, cleaner visual hierarchy

import { useState } from 'react';
import Image from 'next/image';
import { ChefHat, Pencil, Trash2, Eye, EyeOff, Loader2, GripVertical } from 'lucide-react';
import { DietaryDot } from './shared/DietaryDot';
import { TagBadge } from './shared/TagBadge';
import type { MenuItem } from '../types';

interface ItemRowProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => Promise<void> | void;
  onToggle: (item: MenuItem) => void;
}

export function ItemRow({ item, onEdit, onDelete, onToggle }: ItemRowProps) {
  const [deleting, setDeleting] = useState(false);
  const hasVariants = !!item.variants?.length;

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(item.id);
    setDeleting(false);
  }

  return (
    <div
      className="
        group
        flex
        flex-col
        gap-3
        p-4
        rounded-2xl
        transition-colors
        sm:flex-row
        sm:items-center
      "
      style={{
        background: item.is_available
          ? 'transparent'
          : 'rgba(0,0,0,0.02)',
      }}
    >

      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Drag handle */}
        <GripVertical
          size={14}
          className="
            hidden
            sm:block
            md:block
            flex-shrink-0
            cursor-grab
            select-none
            opacity-0
            group-hover:opacity-40
            transition
          "
          style={{ color: 'var(--text2)' }}
        />

        {/* Thumbnail */}
        <div
          className="
          w-16
          h-16
          rounded-xl
          overflow-hidden
          flex
          items-center
          justify-center
          flex-shrink-0
        "
          style={{
            background: 'var(--accentlt)',
            opacity: item.is_available ? 1 : 0.5,
          }}
        >
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              height={100}
              width={50}
              className="object-cover w-full h-full"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <ChefHat size={16} style={{ color: 'var(--accent)' }} />
          )}
        </div>

        {/* Info */}
        <div
          className="flex-1 min-w-0 space-y-2.5"
          style={{ opacity: item.is_available ? 1 : 0.55 }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {item.dietary_type && <DietaryDot type={item.dietary_type} />}
            <span
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--text)' }}
            >
              {item.name}
            </span>
            {!item.is_available && (
              <span
                className="inline-flex  items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
                style={{ background: 'var(--border)', color: 'var(--text2)' }}
              >
                Hidden
              </span>
            )}
          </div>

          {item.description && (
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: 'var(--text2)', maxWidth: '90%' }}
            >
              {item.description}
            </p>
          )}

          {(item.tags?.length ?? 0) > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {item.tags!.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>

      </div>

      <div
        className="
        flex
        items-center
        justify-between
        sm:justify-end
        gap-4
      "
      >

        <div
          className="text-right"
          style={{
            opacity: item.is_available ? 1 : 0.5,
          }}
        >
          <p
            className="text-sm font-bold"
            style={{
              color: 'var(--text)',
              fontVariantNumeric:
                'tabular-nums',
            }}
          >
            ₹{Number(item.price).toFixed(2)}
          </p>

          {hasVariants && (
            <p
              className="text-[10px]"
              style={{
                color: 'var(--text2)',
              }}
            >
              +{item.variants.length} sizes
            </p>
          )}
        </div>

        {/* Actions — always visible on mobile, hover-reveal on desktop */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(item)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text2)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accentlt)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text2)';
            }}
            title={item.is_available ? 'Hide from menu' : 'Show on menu'}
          >
            {item.is_available ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>

          <button
            onClick={() => onEdit(item)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'var(--text2)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accentlt)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text2)';
            }}
            title="Edit item"
          >
            <Pencil size={13} />
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
            style={{ color: '#ef4444' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            title="Delete item"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>

      </div>
    </div>
  );
}