'use client';

// src/features/menu/components/MenuPanel.tsx
//
// Orchestrator only — owns view-only UI state (search, view mode, which
// modal is open) and wires the useMenu hook's data + actions into the
// presentational components below it. No Supabase calls happen here.

import { useState } from 'react';
import { ChefHat, Loader2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Alert, Button, EmptyState } from '../../../components/ui/UiComponents';
import { useMenu } from '../hooks/useMenu';
import { useMenus } from '../hooks/useMenus';
import { MenuHeader } from './MenuHeader';
import { MenuSelector } from './MenuSelector';
import { PlanLimitNotice } from './PlanLimitNotice';
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
    advancedCategories,
    maxMenus,
    canAddMenu,
    canUseAdvancedItemDetails,
  } = useApp();

  const {
    editableMenus,
    parkedMenus,
    selectedMenu,
    loading: menusLoading,
    actions: menuActions,
  } = useMenus(hotel?.id);

  const { state, actions } = useMenu(hotel?.id, selectedMenu?.id, refreshMenuCount);

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

  // Items in THIS menu that the plan is currently withholding. Counted from
  // the loaded categories rather than from a separate query, so it always
  // matches what the list below is showing.
  const hiddenItemCount = state.categories.reduce(
    (total, category) => total + category.items.filter((i) => i.hidden_by_plan).length,
    0
  );

  if (menusLoading || state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  // Menus have loaded and there is nothing editable — a hotel whose first menu
  // was never created, or one where a downgrade parked every menu. The panel
  // used to render the spinner forever in this state, which left the owner
  // with no way to reach the create/restore controls below.
  if (!selectedMenu) {
    return (
      <div className="space-y-5">
        <MenuSelector
          menus={editableMenus}
          parkedMenus={parkedMenus}
          selectedMenuId={null}
          hotelSlug={hotel?.slug ?? null}
          maxMenus={maxMenus}
          canAddMenu={canAddMenu}
          disabled={isActionBlocked}
          onSelect={menuActions.selectMenu}
          onCreate={menuActions.addMenu}
          onRename={menuActions.renameMenu}
          onMakePrimary={menuActions.makePrimary}
          onToggleActive={menuActions.toggleMenuActive}
          onDelete={menuActions.deleteMenu}
          onSwitchLive={menuActions.switchLiveMenu}
        />

        <EmptyState
          icon={ChefHat}
          title={parkedMenus.length ? 'No menu is live on your plan' : 'No menu yet'}
          description={
            parkedMenus.length
              ? 'Your plan allows fewer menus than you have. Pick one above to put back in service, or upgrade to keep them all.'
              : 'Create a menu to start adding categories and dishes.'
          }
          action={
            parkedMenus.length ? (
              <Button variant="primary" onClick={() => onNavigate('billing')}>
                See plans
              </Button>
            ) : undefined
          }
        />
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
          menuName={selectedMenu?.name ?? null}
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <MenuSelector
          menus={editableMenus}
          parkedMenus={parkedMenus}
          selectedMenuId={selectedMenu?.id ?? null}
          hotelSlug={hotel?.slug ?? null}
          maxMenus={maxMenus}
          canAddMenu={canAddMenu}
          disabled={isActionBlocked}
          onSelect={menuActions.selectMenu}
          onCreate={menuActions.addMenu}
          onRename={menuActions.renameMenu}
          onMakePrimary={menuActions.makePrimary}
          onToggleActive={menuActions.toggleMenuActive}
          onDelete={menuActions.deleteMenu}
          onSwitchLive={menuActions.switchLiveMenu}
        />

        <PlanLimitNotice
          hiddenItemCount={hiddenItemCount}
          parkedMenuCount={parkedMenus.length}
          maxMenuItems={maxMenuItems}
          planLabel={planLabel}
          onUpgrade={() => onNavigate('billing')}
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
          onTogglePlanHidden={actions.toggleItemPlanHidden}
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
        canUseAdvancedDetails={canUseAdvancedItemDetails}
        onUpgrade={() => onNavigate('billing')}
      />
    </>
  );
}
