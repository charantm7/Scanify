'use client';

// src/features/menu_builder/hooks/useMenus.ts
//
// Owns the hotel's menu list and which one the builder is editing. Mirrors
// useMenu's shape: a reducer for the data, services that throw, and this hook
// as the single place that catches and toasts.
//
// A reducer rather than three useStates so each transition lands as one atomic
// update — "loaded" sets the rows, clears the error and clears loading
// together, instead of as separate renders that can be observed half-applied.

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import { useApp } from '../../../context/AppContext';
import type { Menu, MenusState } from '../types';
import {
  loadMenus,
  createMenu,
  renameMenuService,
  setMenuActiveService,
  setPrimaryMenuService,
  switchLiveMenuService,
  removeMenu,
  persistMenuOrder,
} from '../services/menus.services';

const INITIAL_STATE: MenusState = { menus: [], loading: true, error: null };

type MenusAction =
  | { type: 'LOADING' }
  | { type: 'LOADED'; payload: Menu[] }
  | { type: 'ERROR'; payload: string }
  | { type: 'ADD'; payload: Menu }
  | { type: 'PATCH'; payload: Partial<Menu> & { id: string } }
  | { type: 'SET_PRIMARY'; payload: string }
  | { type: 'REMOVE'; payload: { id: string; newPrimaryId: string | null } }
  | { type: 'REORDER'; payload: Menu[] };

function reducer(state: MenusState, action: MenusAction): MenusState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOADED':
      return { menus: action.payload, loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD':
      return { ...state, menus: [...state.menus, action.payload] };
    case 'PATCH':
      return {
        ...state,
        menus: state.menus.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      };
    case 'SET_PRIMARY':
      // Exactly one primary per hotel, matching the partial unique index.
      return {
        ...state,
        menus: state.menus.map((m) => ({ ...m, is_primary: m.id === action.payload })),
      };
    case 'REMOVE': {
      const { id, newPrimaryId } = action.payload;
      return {
        ...state,
        menus: state.menus
          .filter((m) => m.id !== id)
          .map((m) => (newPrimaryId ? { ...m, is_primary: m.id === newPrimaryId } : m)),
      };
    }
    case 'REORDER':
      return { ...state, menus: action.payload };
    default:
      return state;
  }
}

export function useMenus(hotelId: string | undefined) {
  const { supabase, refreshMenus } = useApp();
  const toast = useToast();

  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  const { menus, loading, error } = state;

  const load = useCallback(async () => {
    if (!hotelId) return;
    try {
      const rows = await loadMenus(supabase, hotelId);
      dispatch({ type: 'LOADED', payload: rows });
    } catch (err) {
      dispatch({
        type: 'ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load menus',
      });
      toast.error('Failed to load menus');
    }
  }, [hotelId, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  // Menus the owner can actually edit. A menu parked by a downgrade is still
  // listed (so they can see what they lost) but must not be editable, or they
  // would keep working on content that is not being served.
  const editableMenus = useMemo(() => menus.filter((m) => !m.hidden_by_plan), [menus]);
  const parkedMenus = useMemo(() => menus.filter((m) => m.hidden_by_plan), [menus]);

  /**
   * Resolve the selection here rather than in an effect. Deriving it means the
   * builder always has a valid menu to edit on the very first render, and a
   * selection that becomes invalid (its menu deleted or parked) silently falls
   * back instead of leaving the panel pointed at nothing.
   */
  const selectedMenu = useMemo(() => {
    const chosen = editableMenus.find((m) => m.id === selectedMenuId);
    if (chosen) return chosen;
    return editableMenus.find((m) => m.is_primary) ?? editableMenus[0] ?? null;
  }, [editableMenus, selectedMenuId]);

  const selectMenu = useCallback((id: string) => setSelectedMenuId(id), []);

  const addMenu = useCallback(
    async (name: string): Promise<Menu | null> => {
      if (!hotelId) return null;
      try {
        const menu = await createMenu(supabase, hotelId, name, editableMenus, toast);
        dispatch({ type: 'ADD', payload: menu });
        setSelectedMenuId(menu.id);
        // Keep AppContext's menu count in step so the plan meter and the
        // canAddMenu guard update without a reload.
        await refreshMenus?.();
        return menu;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create menu');
        return null;
      }
    },
    [hotelId, supabase, editableMenus, toast, refreshMenus]
  );

  const renameMenu = useCallback(
    async (id: string, name: string) => {
      try {
        await renameMenuService(supabase, id, name, toast);
        dispatch({ type: 'PATCH', payload: { id, name: name.trim() } });
        await refreshMenus?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to rename menu');
      }
    },
    [supabase, toast, refreshMenus]
  );

  const toggleMenuActive = useCallback(
    async (menu: Menu) => {
      const next = !menu.is_active;
      try {
        await setMenuActiveService(supabase, menu, next, toast);
        dispatch({ type: 'PATCH', payload: { id: menu.id, is_active: next } });
        await refreshMenus?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update menu');
      }
    },
    [supabase, toast, refreshMenus]
  );

  const makePrimary = useCallback(
    async (menu: Menu) => {
      if (!hotelId) return;
      try {
        await setPrimaryMenuService(supabase, hotelId, menu, toast);
        dispatch({ type: 'SET_PRIMARY', payload: menu.id });
        await refreshMenus?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update main menu');
      }
    },
    [hotelId, supabase, toast, refreshMenus]
  );

  /** Swaps a plan-parked menu in for the current primary one. */
  const switchLiveMenu = useCallback(
    async (incoming: Menu) => {
      if (!hotelId) return;
      const outgoing = menus.find((m) => m.is_primary && !m.hidden_by_plan);
      if (!outgoing) {
        toast.error('No live menu to swap out.');
        return;
      }

      try {
        await switchLiveMenuService(supabase, hotelId, outgoing, incoming, toast);
        // Reload rather than patching: the swap touches two rows and the
        // primary flag, and a stale local guess here would put the builder out
        // of step with which menu is actually being served.
        await load();
        setSelectedMenuId(incoming.id);
        await refreshMenus?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to switch menu');
      }
    },
    [hotelId, supabase, menus, toast, load, refreshMenus]
  );

  const deleteMenu = useCallback(
    async (menu: Menu) => {
      try {
        const { newPrimaryId } = await removeMenu(supabase, menu, menus, toast);
        dispatch({ type: 'REMOVE', payload: { id: menu.id, newPrimaryId } });
        if (selectedMenuId === menu.id) setSelectedMenuId(null);
        await refreshMenus?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete menu');
      }
    },
    [supabase, menus, toast, selectedMenuId, refreshMenus]
  );

  const reorderMenus = useCallback(
    async (reordered: Menu[]) => {
      dispatch({ type: 'REORDER', payload: reordered });
      try {
        await persistMenuOrder(supabase, reordered);
      } catch {
        toast.error('Failed to save new order');
        load();
      }
    },
    [supabase, toast, load]
  );

  return {
    menus,
    editableMenus,
    parkedMenus,
    selectedMenu,
    loading,
    error,
    actions: {
      load,
      selectMenu,
      addMenu,
      renameMenu,
      toggleMenuActive,
      makePrimary,
      switchLiveMenu,
      deleteMenu,
      reorderMenus,
    },
  };
}
