'use client';

// src/features/menu/components/CategoryBlock.tsx
// Redesigned: more polished category header, better empty state, cleaner item count badge

import { useState } from 'react';
import { Plus, Trash2, Loader2, ChevronDown, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/shared/ui';
import { InlineEdit } from './InlineEdit';
import { IconPicker } from './shared/IconPicker';
import { ItemRow } from './ItemRow';
import { ItemCard } from './ItemCard';
import { useReorderableList } from '../hooks/useReorderableList';
import type { Category, MenuItem, MenuViewMode } from '../types';

interface CategoryBlockProps {
  category: Category;
  viewMode: MenuViewMode;
  isAtCap: boolean;
  onRename: (id: string, name: string) => void;
  onIconChange: (id: string, icon: string) => void;
  onDelete: (id: string) => Promise<void> | void;
  onAddItem: (categoryId: string) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => Promise<void> | void;
  onToggleItem: (item: MenuItem) => void;
  onReorderItems: (categoryId: string, items: MenuItem[]) => void;
}

export function CategoryBlock({
  category,
  viewMode,
  isAtCap,
  onRename,
  onIconChange,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItem,
  onReorderItems,
}: CategoryBlockProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const items = category.items;

  const { dragIndex, overIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd } =
    useReorderableList(items, (reordered) => onReorderItems(category.id, reordered));

  async function handleDelete() {
    if (items.length > 0) {
      toast.error('Remove all items before deleting this category');
      return;
    }
    if (!confirm(`Delete category "${category.name}"?`)) return;
    setDeleting(true);
    await onDelete(category.id);
    setDeleting(false);
  }

  const availableCount = items.filter((i) => i.is_available).length;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: '1.5px solid var(--border)',
        background: 'var(--card)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Category header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{
          background: 'var(--accentlt)',
          borderBottom: collapsed ? 'none' : '1.5px solid var(--border)',
        }}
      >
        {/* Drag handle */}
        <GripVertical
          size={14}
          className="flex-shrink-0 cursor-grab select-none opacity-30 hover:opacity-60 transition"
          style={{ color: 'var(--text2)' }}
        />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronDown
            size={14}
            style={{
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {/* Icon picker */}
        <IconPicker value={category.icon} onChange={(icon) => onIconChange(category.id, icon)} />

        {/* Category name (inline editable) */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <InlineEdit value={category.name} onSave={(name) => onRename(category.id, name)} />
        </div>

        {/* Item count pill */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {items.length}
          </span>
          {items.length > 0 && availableCount < items.length && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{ background: 'var(--border)', color: 'var(--text2)' }}
            >
              {items.length - availableCount} hidden
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => !isAtCap && onAddItem(category.id)}
            disabled={isAtCap}
            title={isAtCap ? 'Menu item limit reached' : 'Add item'}
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Add item</span>
          </Button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition disabled:opacity-50"
            style={{ color: '#ef4444' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            title="Delete category"
          >
            {deleting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </button>
        </div>
      </div>

      {/* Items area */}
      {!collapsed && (
        items.length === 0 ? (
          /* Empty state */
          <div className="py-16 px-4 flex flex-col items-center justify-center gap-3 text-center">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--accentlt)' }}
            >
              {category.icon || '🍽️'}
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: 'var(--text)' }}
              >
                No items in {category.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                Add your first dish or drink to this category
              </p>
            </div>
            {!isAtCap && (
              <button
                onClick={() => onAddItem(category.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Plus size={13} /> Add item
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid view */
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
                onToggle={onToggleItem}
              />
            ))}
          </div>
        ) : (
          /* List view */
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOver(index)}
                onDrop={handleDrop(index)}
                onDragEnd={handleDragEnd}
                style={{
                  opacity: dragIndex === index ? 0.4 : 1,
                  transition: 'opacity 0.15s ease',
                  borderLeft:
                    overIndex === index && dragIndex !== null && dragIndex !== index
                      ? '3px solid var(--accent)'
                      : '3px solid transparent',
                }}
              >
                <ItemRow
                  item={item}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  onToggle={onToggleItem}
                />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}