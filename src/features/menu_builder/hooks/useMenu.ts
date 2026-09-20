'use client';

// src/features/menu/hooks/useMenu.ts
//
// Owns the reducer + all CRUD/reorder actions for the menu builder.
// Mirrors the `run()`-wrapper pattern from useAuth: services throw,
// this hook is the single place that catches and toasts.

import { useCallback, useEffect, useReducer, useRef } from 'react';
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
  setItemPlanHiddenService,
  persistItemOrder,
} from '../services/menu.services';
import { useApp } from '../../../context/AppContext';

const INITIAL_STATE: MenuState = { categories: [], loading: true, error: null };

function reducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, categories: [], loading: true, error: null };
    // Settled with nothing to load — no hotel or no editable menu yet. Without
    // this the reducer had no way out of `loading`, so an account with no
    // selectable menu (a brand new hotel, or every menu parked by a downgrade)
    // sat on the spinner forever and could never reach the create-menu button.
    case 'EMPTY':
      return { categories: [], loading: false, error: null };
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

/**
 * `menuId` scopes every read and category write to one menu. It is undefined
 * only while useMenus is still resolving which menu to edit, so the hook
 * reports `loading` rather than briefly rendering an empty menu.
 */
export function useMenu(
  hotelId: string | undefined,
  menuId: string | undefined,
  onItemCountChange?: () => void | Promise<void>
) {
  const { supabase } = useApp()
  const toast = useToast();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Every load takes a ticket; only the newest one is allowed to write to
  // state. Switching menus quickly used to be a race — whichever request the
  // network happened to finish last won, so a fast menu could be overwritten
  // by a slower earlier one and the builder would show the wrong menu's
  // categories under the right menu's name.
  const loadTicket = useRef(0);

  const loadMenu = useCallback(async () => {
    if (!hotelId || !menuId) return;
    const ticket = ++loadTicket.current;
    try {
      const categories = await loadMenuData(supabase, menuId);
      if (ticket !== loadTicket.current) return;
      dispatch({ type: 'LOADED', payload: categories });
    } catch (err) {
      if (ticket !== loadTicket.current) return;
      const message = err instanceof Error ? err.message : 'Unknown error';
      dispatch({ type: 'ERROR', payload: message });
      toast.error('Failed to load menu');
    }
  }, [hotelId, menuId, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!menuId || !hotelId) {
      // Invalidate any request still in flight, then settle. Reporting
      // "loading" here instead was what produced the permanent spinner.
      loadTicket.current++;
      dispatch({ type: 'EMPTY' });
      return;
    }
    // Back to loading first: without this, switching menus keeps the previous
    // menu's categories on screen until the new fetch resolves, which reads as
    // the wrong menu's content rather than as loading.
    dispatch({ type: 'LOADING' });
    loadMenu();
  }, [loadMenu, hotelId, menuId]);

  const addCategory = useCallback(
    async (name: string, icon: string | null) => {
      if (!hotelId || !menuId) return;
      try {
        const category = await createCategory(
          supabase, hotelId, menuId, name, icon, state.categories, toast
        );
        dispatch({ type: 'ADD_CATEGORY', payload: category });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to add category');
      }
    },
    [hotelId, menuId, supabase, state.categories, toast]
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
        // Deleting a category takes its items with it. Without this the plan
        // meter kept counting them, so an owner who cleared a category still
        // saw "limit reached" and could not add anything back until reload.
        await onItemCountChange?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete category');
      }
    },
    [supabase, toast, onItemCountChange]
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

  const toggleItemPlanHidden = useCallback(
    async (item: MenuItem) => {
      const next = !item.hidden_by_plan;
      // Not optimistic: the database can refuse this (the plan is full), and
      // showing the item as restored before finding out would be a lie.
      try {
        await setItemPlanHiddenService(supabase, item.id, next);
        dispatch({ type: 'UPDATE_ITEM', payload: { id: item.id, hidden_by_plan: next } });
        toast.success(next ? 'Item hidden' : 'Item restored');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update item');
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
      toggleItemPlanHidden,
      reorderItems,
    },
  };
}
