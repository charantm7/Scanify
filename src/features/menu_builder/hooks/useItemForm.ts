'use client';

// src/features/menu/hooks/useItemForm.ts
//
// Local form state + validation for the item create/edit form.
// Kept separate from useMenu so the form has no idea Supabase exists.

import { useState, useCallback } from 'react';
import type { ItemFormValues, ItemFormErrors, PriceVariant, MenuItem, ItemTag } from '../types';
import { EMPTY_ITEM_FORM, MAX_VARIANTS_PER_ITEM } from '../constants';

function genId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function toFormValues(item?: MenuItem | null): ItemFormValues {
  if (!item) return EMPTY_ITEM_FORM;

  const variants =
    item.variants?.flatMap((v) => {
      try {
        const variant =
          typeof v === 'string'
            ? JSON.parse(v)
            : v;

        return [{
          id:
            variant.id ??
            genId(),
          label:
            variant.label ?? '',
          price:
            variant.price ?? 0,
        }];
      } catch {
        return [];
      }
    }) ?? [];
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    price: String(item.price ?? ''),
    variants,
    image_url: item.image_url ?? '',
    is_available: item.is_available,
    dietary_type: item.dietary_type ?? '',
    tags: item.tags ?? [],
    spice_level: item.spice_level ?? '',
  };
}

export function useItemForm(initial?: MenuItem | null) {
  const [form, setForm] = useState<ItemFormValues>(() => toFormValues(initial));
  const [errors, setErrors] = useState<ItemFormErrors>({});

  const reset = useCallback((item?: MenuItem | null) => {
    setForm(toFormValues(item));
    setErrors({});
  }, []);

  const setField = useCallback(<K extends keyof ItemFormValues>(field: K, value: ItemFormValues[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field as keyof ItemFormErrors]: undefined }));
  }, []);

  const toggleTag = useCallback((tag: ItemTag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  }, []);

  const addVariant = useCallback(() => {
    setForm((f) => {
      if (f.variants.length >= MAX_VARIANTS_PER_ITEM) return f;
      const variant: PriceVariant = { id: genId(), label: '', price: 0 };
      return { ...f, variants: [...f.variants, variant] };
    });
  }, []);

  const updateVariant = useCallback((id: string, patch: Partial<PriceVariant>) => {
    setForm((f) => ({ ...f, variants: f.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) }));
  }, []);

  const removeVariant = useCallback((id: string) => {
    setForm((f) => ({ ...f, variants: f.variants.filter((v) => v.id !== id) }));
  }, []);

  const validate = useCallback((): boolean => {
    const nextErrors: ItemFormErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Item name is required';
    if (!form.price || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      nextErrors.price = 'Enter a valid base price';
    }
    const incompleteVariant = form.variants.some((v) => !v.label.trim() || Number.isNaN(Number(v.price)));
    if (incompleteVariant) nextErrors.variants = 'Fill in or remove incomplete price variants';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [form]);

  return { form, errors, setField, toggleTag, addVariant, updateVariant, removeVariant, validate, reset };
}
