'use client';

// src/features/menu/hooks/useMenu.ts
//
// Owns the reducer + all CRUD/reorder actions for the menu builder.
// Mirrors the `run()`-wrapper pattern from useAuth: services throw,
// this hook is the single place that catches and toasts.

import { useCallback, useEffect, useReducer } from 'react';
import { useToast } from '../../../hooks/useToast';
import { getSupabaseClient } from '../../../lib/supabase/client';
import type { Category, MenuItem, ItemFormValues, MenuAction, MenuState } from '../types';
import {
  loadMenuData,
  createCategory,
  renameCategoryService,
  updateCategoryIconService,
  removeCategory,
  persistCategoryOrder,
  createItem,
  updateItemService,
  removeItem,
  setItemAvailabilityService,
  persistItemOrder,
} from '../services/menu.services';
import { useApp } from '../../../context/AppContext';

const INITIAL_STATE: MenuState = { categories: [], loading: true, error: null };

function reducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case 'LOADED':
      return { ...state, categories: action.payload, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? { ...c, ...action.payload } : c)),
      };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) };
    case 'REORDER_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_ITEM':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.category_id ? { ...c, items: [...c.items, action.payload] } : c
        ),
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        categories: state.categories.map((c) => ({
          ...c,
          items: c.items.map((i) => (i.id === action.payload.id ? { ...i, ...action.payload } : i)),
        })),
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        categories: state.categories.map((c) => ({ ...c, items: c.items.filter((i) => i.id !== action.payload) })),
      };
    case 'REORDER_ITEMS':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.categoryId ? { ...c, items: action.payload.items } : c
        ),
      };
    default:
      return state;
  }
}

export function useMenu(hotelId: string | undefined, onItemCountChange?: () => void | Promise<void>) {
  const { supabase } = useApp()
  const toast = useToast();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const loadMenu = useCallback(async () => {
    if (!hotelId) return;
    try {
      const categories = await loadMenuData(supabase, hotelId);
      dispatch({ type: 'LOADED', payload: categories });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      dispatch({ type: 'ERROR', payload: message });
      toast.error('Failed to load menu');
    }
  }, [hotelId, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const addCategory = useCallback(
    async (name: string, icon: string | null) => {
      if (!hotelId) return;
      try {
        const category = await createCategory(supabase, hotelId, name, icon, state.categories, toast);
        dispatch({ type: 'ADD_CATEGORY', payload: category });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to add category');
      }
    },
    [hotelId, supabase, state.categories, toast]
  );

  const renameCategory = useCallback(
    async (id: string, name: string) => {
      try {
        await renameCategoryService(supabase, id, name, toast);
        dispatch({ type: 'UPDATE_CATEGORY', payload: { id, name } });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to rename category');
      }
    },
    [supabase, toast]
  );

  const updateCategoryIcon = useCallback(
    async (id: string, icon: string) => {
      try {
        await updateCategoryIconService(supabase, id, icon, toast);
        dispatch({ type: 'UPDATE_CATEGORY', payload: { id, icon } });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update icon');
      }
    },
    [supabase, toast]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await removeCategory(supabase, id, toast);
        dispatch({ type: 'DELETE_CATEGORY', payload: id });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete category');
      }
    },
    [supabase, toast]
  );

  const reorderCategories = useCallback(
    async (reordered: Category[]) => {
      dispatch({ type: 'REORDER_CATEGORIES', payload: reordered });
      try {
        await persistCategoryOrder(supabase, reordered);
      } catch {
        toast.error('Failed to save new order');
        loadMenu();
      }
    },
    [supabase, loadMenu, toast]
  );

  const saveItem = useCallback(
    async (form: ItemFormValues, existing: MenuItem | null, categoryId: string) => {
      if (!hotelId) return false;
      try {
        if (existing) {

          const patch = await updateItemService(supabase, existing.id, form, toast);
          dispatch({ type: 'UPDATE_ITEM', payload: { id: existing.id, ...patch } });
        } else {
          const categoryItems = state.categories.find((c) => c.id === categoryId)?.items ?? [];
          const item = await createItem(supabase, hotelId, categoryId, form, categoryItems, toast);
          dispatch({ type: 'ADD_ITEM', payload: item });
          await onItemCountChange?.();
        }
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save item');
        return false;
      }
    },
    [hotelId, supabase, state.categories, toast, onItemCountChange]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await removeItem(supabase, id, toast);
        dispatch({ type: 'DELETE_ITEM', payload: id });
        await onItemCountChange?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete item');
      }
    },
    [supabase, toast, onItemCountChange]
  );

  const toggleItemAvailability = useCallback(
    async (item: MenuItem) => {
      const next = !item.is_available;
      dispatch({ type: 'UPDATE_ITEM', payload: { id: item.id, is_available: next } });
      try {
        await setItemAvailabilityService(supabase, item.id, next);
      } catch {
        dispatch({ type: 'UPDATE_ITEM', payload: { id: item.id, is_available: item.is_available } });
        toast.error('Failed to update availability');
      }
    },
    [supabase, toast]
  );

  const reorderItems = useCallback(
    async (categoryId: string, reordered: MenuItem[]) => {
      dispatch({ type: 'REORDER_ITEMS', payload: { categoryId, items: reordered } });
      try {
        await persistItemOrder(supabase, reordered);
      } catch {
        toast.error('Failed to save new order');
        loadMenu();
      }
    },
    [supabase, loadMenu, toast]
  );

  return {
    state,
    actions: {
      loadMenu,
      addCategory,
      renameCategory,
      updateCategoryIcon,
      deleteCategory,
      reorderCategories,
      saveItem,
      deleteItem,
      toggleItemAvailability,
      reorderItems,
    },
  };
}
