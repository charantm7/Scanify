'use client';

// src/features/menu/components/ItemCard.tsx — grid-view card
// Redesigned: taller image area, cleaner info section, better action UX

import { useState } from 'react';
import Image from 'next/image';
import { ChefHat, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { DietaryDot } from './shared/DietaryDot';
import { TagBadge } from './shared/TagBadge';
import type { MenuItem } from '../types';

interface ItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => Promise<void> | void;
  onToggle: (item: MenuItem) => void;
}

export function ItemCard({ item, onEdit, onDelete, onToggle }: ItemCardProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(item.id);
    setDeleting(false);
  }

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col group"
      style={{
        border: '1.5px solid var(--border)',
        background: 'var(--card)',
        opacity: item.is_available ? 1 : 0.65,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        className="relative h-32 flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--accentlt)' }}
      >
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            height={500}
            width={500}
            className="object-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <ChefHat size={200} style={{ color: 'var(--accent)', opacity: 0.4 }} />
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 60%)' }}
        />

        {!item.is_available && (
          <div className="absolute bottom-2 left-2">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
              style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
              Hidden
            </span>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(item)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition shadow-sm"
            style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--text2)', backdropFilter: 'blur(4px)' }}
            title={item.is_available ? 'Hide from menu' : 'Show on menu'}
          >
            {item.is_available ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button
            onClick={() => onEdit(item)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition shadow-sm"
            style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--accent)', backdropFilter: 'blur(4px)' }}
            title="Edit item"
          >
            <Pencil size={13} />
          </button>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          {item.dietary_type && (
            <div className="flex-shrink-0">
              <DietaryDot type={item.dietary_type} />
            </div>
          )}
          <p
            className="text-sm font-semibold leading-snug flex-1 line-clamp-2"
            style={{ color: 'var(--text)' }}
          >
            {item.name}
          </p>
        </div>

        {item.description && (
          <p
            className="text-xs line-clamp-2 leading-relaxed"
            style={{ color: 'var(--text2)' }}
          >
            {item.description}
          </p>
        )}
        {(item.tags?.length ?? 0) > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {item.tags!.slice(0, 2).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
            {item.tags!.length > 2 && (
              <span className="text-[10px]" style={{ color: 'var(--text2)' }}>
                +{item.tags!.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Price + delete */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div>
            <span
              className="text-sm font-bold block"
              style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}
            >
              ₹{Number(item.price).toFixed(2)}
            </span>
            {item.variants?.length ? (
              <span className="text-[10px] font-medium" style={{ color: 'var(--text2)' }}>
                +{item.variants.length} sizes
              </span>
            ) : null}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-50"
            style={{ color: '#ef4444' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            title="Delete item"
          >
            {deleting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}