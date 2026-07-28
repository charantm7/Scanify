'use client';

// src/features/menu/components/CategoryList.tsx

import { ChefHat, Plus } from 'lucide-react';
import { EmptyState, Button } from '../../../components/shared/UiComponents';
import { CategoryBlock } from './CategoryBlock';
import { useReorderableList } from '../hooks/useReorderableList';
import type { Category, MenuItem, MenuViewMode } from '../types';

interface CategoryListProps {
  categories: Category[];
  viewMode: MenuViewMode;
  isAtCap: boolean;
  search: string;
  onRename: (id: string, name: string) => void;
  onIconChange: (id: string, icon: string) => void;
  onDelete: (id: string) => Promise<void> | void;
  onAddItem: (categoryId: string) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => Promise<void> | void;
  onToggleItem: (item: MenuItem) => void;
  onReorderItems: (categoryId: string, items: MenuItem[]) => void;
  onReorderCategories: (categories: Category[]) => void;
  onCreateFirstCategory: () => void;
  isAdvanceCategory: boolean;
}

function filterCategories(categories: Category[], search: string): Category[] {
  if (!search.trim()) return categories;
  const q = search.trim().toLowerCase();
  return categories
    .map((c) => ({
      ...c,
      items: c.items.filter(
        (i) => i.name.toLowerCase().includes(q) || (i.description ?? '').toLowerCase().includes(q)
      ),
    }))
    .filter((c) => c.items.length > 0 || c.name.toLowerCase().includes(q));
}

export function CategoryList({
  categories,
  viewMode,
  isAtCap,
  search,
  onRename,
  onIconChange,
  onDelete,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleItem,
  onReorderItems,
  onReorderCategories,
  onCreateFirstCategory,
  isAdvanceCategory

}: CategoryListProps) {
  const visible = filterCategories(categories, search);

  const { dragIndex, overIndex, handleDragStart, handleDragOver, handleDrop, handleDragEnd } = useReorderableList(
    categories,
    onReorderCategories
  );

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={ChefHat}
        title="No categories yet"
        description="Start by adding a category like 'Starters', 'Mains', or 'Drinks', then add items to it."
        action={
          <Button variant="primary" onClick={onCreateFirstCategory}>
            <Plus size={15} /> Add first category
          </Button>
        }
      />
    );
  }

  if (visible.length === 0) {
    return <p className="text-sm text-theme2 text-center py-8">No items match your search.</p>;
  }

  return (
    <div className="space-y-4">
      {visible.map((category) => {
        const index = categories.findIndex((c) => c.id === category.id);
        return (
          <div
            key={category.id}
            draggable={!search}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDrop={handleDrop(index)}
            onDragEnd={handleDragEnd}
            style={{
              opacity: dragIndex === index ? 0.5 : 1,
              borderTop:
                overIndex === index && dragIndex !== null && dragIndex !== index ? '2px solid var(--accent)' : undefined,
            }}
          >
            <CategoryBlock
              category={category}
              viewMode={viewMode}
              isAtCap={isAtCap}
              onRename={onRename}
              onIconChange={onIconChange}
              onDelete={onDelete}
              onAddItem={onAddItem}
              onEditItem={onEditItem}
              onDeleteItem={onDeleteItem}
              onToggleItem={onToggleItem}
              onReorderItems={onReorderItems}
              isAdvanceCategory={isAdvanceCategory}
            />
          </div>
        );
      })}
    </div>
  );
}
