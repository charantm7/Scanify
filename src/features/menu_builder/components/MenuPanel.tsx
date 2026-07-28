'use client';

// src/features/menu/components/MenuPanel.tsx
//
// Orchestrator only — owns view-only UI state (search, view mode, which
// modal is open) and wires the useMenu hook's data + actions into the
// presentational components below it. No Supabase calls happen here.

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Alert, Button } from '../../../components/shared/UiComponents';
import { useMenu } from '../hooks/useMenu';
import { MenuHeader } from './MenuHeader';
import { UpgradeAlerts } from './UpgradeAlerts';
import { CategoryCreateBar } from './CategoryCreateBar';
import { CategoryList } from './CategoryList';
import { ItemFormModal } from './ItemFormModal';
import type { ItemModalState, MenuViewMode, MenuItem, ItemFormValues } from '../types';

interface MenuPanelProps {
  onNavigate: (panel: string) => void;
}

export default function MenuPanel({ onNavigate }: MenuPanelProps) {
  const {
    hotel,
    isAtMenuLimit,
    menuItemCount,
    refreshMenuCount,
    isTrialExpired,
    isTrialing,
    planLabel,
    maxMenuItems,
    isActionBlocked,
    advancedCategories
  } = useApp();


  const { state, actions } = useMenu(hotel?.id, refreshMenuCount);

  const [itemModal, setItemModal] = useState<ItemModalState>({ open: false, item: null, categoryId: null });
  const [savingItem, setSavingItem] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<MenuViewMode>('list');

  async function handleCreateCategory(name: string, icon: string | null) {
    setAddingCategory(true);
    await actions.addCategory(name, icon);
    setAddingCategory(false);
  }

  async function handleSaveItem(values: ItemFormValues) {
    if (!itemModal.categoryId) return;
    setSavingItem(true);
    const success = await actions.saveItem(values, itemModal.item, itemModal.categoryId);
    setSavingItem(false);
    if (success) setItemModal({ open: false, item: null, categoryId: null });
  }

  function openAddItem(categoryId: string) {
    setItemModal({ open: true, item: null, categoryId });
  }

  function openEditItem(item: MenuItem) {
    setItemModal({ open: true, item, categoryId: item.category_id });
  }

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  if (state.error) {
    return (
      <Alert
        type="error"
        title="Failed to load menu"
        message={state.error}
        action={
          <Button size="sm" onClick={() => actions.loadMenu()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-5">
        <MenuHeader
          totalItems={menuItemCount}
          maxMenuItems={maxMenuItems}
          planLabel={planLabel}
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <UpgradeAlerts
          isTrialExpired={isTrialExpired}
          isAtMenuLimit={isAtMenuLimit}
          isTrialing={isTrialing}
          maxMenuItems={maxMenuItems}
          onUpgrade={() => onNavigate('billing')}
        />

        <CategoryCreateBar disabled={isActionBlocked} loading={addingCategory} onCreate={handleCreateCategory} />

        <CategoryList
          categories={state.categories}
          viewMode={viewMode}
          isAtCap={isActionBlocked}
          search={search}
          onRename={actions.renameCategory}
          onIconChange={actions.updateCategoryIcon}
          onDelete={actions.deleteCategory}
          onAddItem={openAddItem}
          onEditItem={openEditItem}
          onDeleteItem={actions.deleteItem}
          onToggleItem={actions.toggleItemAvailability}
          onReorderItems={actions.reorderItems}
          onReorderCategories={actions.reorderCategories}
          onCreateFirstCategory={() => handleCreateCategory('Mains', null)}
          isAdvanceCategory={advancedCategories}

        />


      </div>
      <ItemFormModal
        modal={itemModal}
        saving={savingItem}
        onClose={() => setItemModal({ open: false, item: null, categoryId: null })}
        onSubmit={handleSaveItem}
        isAdvanceCategory={advancedCategories}
      />
    </>
  );
}
