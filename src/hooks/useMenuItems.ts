'use client';

import { useCallback, useEffect, useReducer } from "react";
import { useApp } from "../context/AppContext";
import {
    getCategories,
    getMenuItems,
    createCategory,
    updateCategory,
    deleteCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability
} from "../lib/queries/menu";
import type { CategoryRow, MenuItemRow, CategoryUpdate, MenuItemInsert, MenuItemUpdate } from "../types/supabase";


interface MenuState {
    categories: CategoryRow[];
    items: MenuItemRow[];
    loading: boolean;
    error: string | null;
}

const INITIAL_STATE: MenuState = {
    categories: [],
    items: [],
    loading: true,
    error: null
}

type MenuAction =
    | { type: 'LOADED'; categories: CategoryRow[]; items: MenuItemRow[] }
    | { type: 'ERROR'; message: string }
    | { type: 'ADD_CATEGORY'; payload: CategoryRow }
    | { type: 'UPDATE_CATEGORY'; payload: CategoryRow }
    | { type: 'REMOVE_CATEGORY'; id: string }
    | { type: 'ADD_ITEM'; payload: MenuItemRow }
    | { type: 'UPDATE_ITEM'; payload: MenuItemRow }
    | { type: 'REMOVE_ITEM'; id: string }
    | { type: 'TOGGLE_ITEM'; id: string; isAvailable: boolean };


function reducer(state: MenuState, action: MenuAction): MenuState {
    switch (action.type) {
        case 'LOADED':
            return { ...state, categories: action.categories, items: action.items, loading: false, error: null };

        case 'ERROR':
            return { ...state, loading: false, error: action.message };

        case 'ADD_CATEGORY':
            return { ...state, categories: [...state.categories, action.payload] };

        case 'UPDATE_CATEGORY':
            return {
                ...state,
                categories: state.categories.map(c =>
                    c.id === action.payload.id ? action.payload : c,
                ),
            };

        case 'REMOVE_CATEGORY':
            return {
                ...state,
                // Also remove all items in this category (mirrors DB cascade)
                categories: state.categories.filter(c => c.id !== action.id),
                items: state.items.filter(i => i.category_id !== action.id),
            };

        case 'ADD_ITEM':
            return { ...state, items: [...state.items, action.payload] };

        case 'UPDATE_ITEM':
            return {
                ...state,
                items: state.items.map(i => i.id === action.payload.id ? action.payload : i),
            };

        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter(i => i.id !== action.id) };

        case 'TOGGLE_ITEM':
            return {
                ...state,
                items: state.items.map(i =>
                    i.id === action.id ? { ...i, is_available: action.isAvailable } : i,
                ),
            };

        default:
            return state;
    }
}



// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMenuItems() {
    const { hotel, supabase, refreshMenuCount } = useApp();
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

    // ── Load ────
    useEffect(() => {
        if (!hotel?.id) {
            dispatch({ type: 'LOADED', categories: [], items: [] });
            return;
        }

        let cancelled = false;

        async function load() {
            try {
                const [categories, items] = await Promise.all([
                    getCategories(supabase, hotel.id),
                    getMenuItems(supabase, hotel.id),
                ]);
                if (!cancelled) dispatch({ type: 'LOADED', categories, items });
            } catch (err) {
                if (!cancelled) dispatch({ type: 'ERROR', message: (err as Error).message });
            }
        }

        load();
        return () => { cancelled = true; };
    }, [hotel?.id]);

    // ── Category mutations ──────────────────────────────────────────────────────

    const addCategory = useCallback(async (name: string) => {
        if (!hotel?.id) return;
        const sortOrder = state.categories.length;
        const row = await createCategory(supabase, {
            hotel_id: hotel.id,
            name: name.trim(),
            sort_order: sortOrder,
        });
        dispatch({ type: 'ADD_CATEGORY', payload: row });
    }, [hotel?.id, state.categories.length, supabase]);

    const editCategory = useCallback(async (categoryId: string, patch: CategoryUpdate) => {
        const row = await updateCategory(supabase, categoryId, patch);
        dispatch({ type: 'UPDATE_CATEGORY', payload: row });
    }, [supabase]);

    const removeCategory = useCallback(async (categoryId: string) => {
        await deleteCategory(supabase, categoryId);
        dispatch({ type: 'REMOVE_CATEGORY', id: categoryId });
        // Refresh global count — items were cascade-deleted
        await refreshMenuCount();
    }, [supabase, refreshMenuCount]);

    // ── Item mutations ──────────────────────────────────────────────────────────

    const addItem = useCallback(async (payload: MenuItemInsert) => {
        const row = await createMenuItem(supabase, payload);
        dispatch({ type: 'ADD_ITEM', payload: row });
        await refreshMenuCount();
    }, [supabase, refreshMenuCount]);

    const editItem = useCallback(async (itemId: string, patch: MenuItemUpdate) => {
        const row = await updateMenuItem(supabase, itemId, patch);
        dispatch({ type: 'UPDATE_ITEM', payload: row });
    }, [supabase]);

    const removeItem = useCallback(async (itemId: string) => {
        await deleteMenuItem(supabase, itemId);
        dispatch({ type: 'REMOVE_ITEM', id: itemId });
        await refreshMenuCount();
    }, [supabase, refreshMenuCount]);

    const toggleItem = useCallback(async (itemId: string, isAvailable: boolean) => {
        // Optimistic update first — feels instant
        dispatch({ type: 'TOGGLE_ITEM', id: itemId, isAvailable });
        try {
            await toggleItemAvailability(supabase, itemId, isAvailable);
        } catch (err) {
            // Rollback on failure
            dispatch({ type: 'TOGGLE_ITEM', id: itemId, isAvailable: !isAvailable });
            throw err;
        }
    }, [supabase]);

    // Group Category with items
    const categoriesWithItems = state.categories.map(cat => ({
        ...cat,
        items: state.items.filter(item => item.category_id === cat.id),
    }));

    return {
        // State
        categories: state.categories,
        items: state.items,
        categoriesWithItems,
        loading: state.loading,
        error: state.error,

        // Category actions
        addCategory,
        editCategory,
        removeCategory,

        // Item actions
        addItem,
        editItem,
        removeItem,
        toggleItem,
    };
}