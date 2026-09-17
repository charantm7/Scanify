'use client';

// src/features/menu_builder/components/MenuSelector.tsx
//
// Switches which menu the builder is editing, and owns the per-menu actions
// (rename, make primary, show/hide, delete, create).
//
// Layout note: the menu list is a horizontally scrollable strip on small
// screens and wraps on larger ones. A dropdown would hide how many menus
// exist, which is the whole point of the Growth plan's allowance.

import { useState } from 'react';
import {
  Plus, Star, Eye, EyeOff, Pencil, Trash2, Check, X, Lock, ExternalLink, Loader2,
} from 'lucide-react';
import type { Menu } from '../types';
import { publicMenuUrl } from '../../../lib/domains';

interface MenuSelectorProps {
  menus: Menu[];
  parkedMenus: Menu[];
  selectedMenuId: string | null;
  hotelSlug: string | null;
  maxMenus: number;
  canAddMenu: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
  onCreate: (name: string) => Promise<unknown>;
  onRename: (id: string, name: string) => Promise<void>;
  onMakePrimary: (menu: Menu) => Promise<void>;
  onToggleActive: (menu: Menu) => Promise<void>;
  onDelete: (menu: Menu) => Promise<void>;
}

function IconButton({
  title, onClick, children, danger, disabled,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        border: '1.5px solid var(--border)',
        background: 'var(--card)',
        color: danger ? '#dc2626' : 'var(--text2)',
      }}
    >
      {children}
    </button>
  );
}

export function MenuSelector({
  menus,
  parkedMenus,
  selectedMenuId,
  hotelSlug,
  maxMenus,
  canAddMenu,
  disabled,
  onSelect,
  onCreate,
  onRename,
  onMakePrimary,
  onToggleActive,
  onDelete,
}: MenuSelectorProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const selected = menus.find((m) => m.id === selectedMenuId) ?? null;
  const atLimit = maxMenus !== -1 && menus.length >= maxMenus;

  async function submitCreate() {
    if (!newName.trim() || busy) return;
    setBusy(true);
    const created = await onCreate(newName.trim());
    setBusy(false);
    if (created) {
      setNewName('');
      setCreating(false);
    }
  }

  async function submitRename() {
    if (!renamingId || !renameValue.trim() || busy) return;
    setBusy(true);
    await onRename(renamingId, renameValue.trim());
    setBusy(false);
    setRenamingId(null);
  }

  // A single menu with no room to add more is just noise — the builder header
  // already says which menu is being edited.
  if (menus.length <= 1 && atLimit && !parkedMenus.length) return null;

  return (
    <div className="space-y-3">
      {/* Menu tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1">
        {menus.map((menu) => {
          const active = menu.id === selected?.id;
          return (
            <button
              key={menu.id}
              type="button"
              onClick={() => onSelect(menu.id)}
              aria-current={active ? 'true' : undefined}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accentlt)' : 'var(--card)',
                color: active ? 'var(--accent)' : 'var(--text2)',
              }}
            >
              {menu.is_primary && (
                <Star size={12} fill="currentColor" aria-label="Main menu" />
              )}
              <span className="max-w-[10rem] truncate">{menu.name}</span>
              {!menu.is_active && (
                <EyeOff size={12} aria-label="Hidden" style={{ opacity: 0.7 }} />
              )}
            </button>
          );
        })}

        {creating ? (
          <div className="flex-shrink-0 flex items-center gap-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCreate();
                if (e.key === 'Escape') { setCreating(false); setNewName(''); }
              }}
              placeholder="Drinks"
              maxLength={60}
              className="w-32 px-3 py-2 rounded-xl text-sm outline-none"
              style={{
                border: '1.5px solid var(--accent)',
                background: 'var(--card)',
                color: 'var(--text)',
              }}
            />
            <IconButton title="Create menu" onClick={submitCreate} disabled={busy || !newName.trim()}>
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </IconButton>
            <IconButton title="Cancel" onClick={() => { setCreating(false); setNewName(''); }}>
              <X size={14} />
            </IconButton>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            disabled={disabled || !canAddMenu}
            title={
              atLimit
                ? `Your plan includes ${maxMenus} menu${maxMenus === 1 ? '' : 's'}`
                : 'Add a menu'
            }
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              border: '1.5px dashed var(--border)',
              background: 'transparent',
              color: 'var(--text2)',
            }}
          >
            {atLimit ? <Lock size={13} /> : <Plus size={14} />}
            Add menu
          </button>
        )}
      </div>

      {/* Actions for the selected menu */}
      {selected && (
        <div className="flex flex-wrap items-center gap-2">
          {renamingId === selected.id ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename();
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                maxLength={60}
                className="w-40 px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{
                  border: '1.5px solid var(--accent)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                }}
              />
              <IconButton title="Save name" onClick={submitRename} disabled={busy}>
                <Check size={14} />
              </IconButton>
              <IconButton title="Cancel" onClick={() => setRenamingId(null)}>
                <X size={14} />
              </IconButton>
            </div>
          ) : (
            <>
              <IconButton
                title="Rename menu"
                disabled={disabled}
                onClick={() => { setRenamingId(selected.id); setRenameValue(selected.name); }}
              >
                <Pencil size={13} />
              </IconButton>

              {!selected.is_primary && (
                <IconButton
                  title="Make this the main menu"
                  disabled={disabled || !selected.is_active}
                  onClick={() => onMakePrimary(selected)}
                >
                  <Star size={13} />
                </IconButton>
              )}

              <IconButton
                title={selected.is_active ? 'Hide from diners' : 'Show to diners'}
                disabled={disabled || (selected.is_active && selected.is_primary)}
                onClick={() => onToggleActive(selected)}
              >
                {selected.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
              </IconButton>

              <IconButton
                title="Delete menu"
                danger
                disabled={disabled || menus.length <= 1}
                onClick={() => onDelete(selected)}
              >
                <Trash2 size={13} />
              </IconButton>

              {hotelSlug && (
                <a
                  href={publicMenuUrl(hotelSlug, selected.is_primary ? null : selected.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-semibold transition"
                  style={{
                    border: '1.5px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--text2)',
                  }}
                >
                  <ExternalLink size={12} />
                  <span className="hidden sm:inline">View live</span>
                </a>
              )}

              <span className="text-xs font-medium ml-auto" style={{ color: 'var(--text2)' }}>
                {maxMenus === -1
                  ? `${menus.length} menus`
                  : `${menus.length} / ${maxMenus} menus`}
              </span>
            </>
          )}
        </div>
      )}

      {/* Menus a downgrade took out of service */}
      {parkedMenus.length > 0 && (
        <div
          className="rounded-xl p-3 text-xs"
          style={{ background: 'var(--accentlt)', color: 'var(--text2)' }}
        >
          <p className="font-bold mb-1" style={{ color: 'var(--accent)' }}>
            {parkedMenus.length} menu{parkedMenus.length === 1 ? '' : 's'} paused by your current plan
          </p>
          <p className="leading-snug">
            {parkedMenus.map((m) => m.name).join(', ')} —{' '}
            {parkedMenus.length === 1 ? 'it is' : 'they are'} saved but not shown to diners.
            Upgrade to bring {parkedMenus.length === 1 ? 'it' : 'them'} back.
          </p>
        </div>
      )}
    </div>
  );
}
