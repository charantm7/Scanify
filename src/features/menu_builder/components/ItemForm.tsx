'use client';

// src/features/menu/components/ItemForm.tsx
// Redesigned: cleaner section dividers, better field grouping, improved mobile layout

import { useState } from 'react';
import { ChefHat, IndianRupee, ImageIcon, Plus, X as XIcon, Info } from 'lucide-react';
import { Input, Textarea, Toggle, Button } from '../../../components/shared/UiComponents';
import { DIETARY_META, TAG_META, MAX_VARIANTS_PER_ITEM, SPICE_LEVEL_META } from '../constants';
import { useItemForm } from '../hooks/useItemForm';
import type { MenuItem, DietaryType, ItemTag, ItemFormValues, SpiceLevel } from '../types';

interface ItemFormProps {
  initial?: MenuItem | null;
  onSubmit: (values: ItemFormValues) => void;
  loading?: boolean;
  isAdvanceCategory: boolean;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] font-bold uppercase tracking-widest mb-2"
      style={{ color: 'var(--text2)' }}
    >
      {children}
    </p>
  );
}

export function ItemForm({ initial = null, onSubmit, loading, isAdvanceCategory }: ItemFormProps) {
  const { form, errors, setField, toggleTag, addVariant, updateVariant, removeVariant, validate } =
    useItemForm(initial);

  function handleSubmit() {
    if (!validate()) return;
    onSubmit(form);
  }

  return (
    <div className="grid md:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-4">

      <div className='space-y-4'>
        {/* ── Basic info ── */}
        <section className="space-y-3">
          <SectionLabel>Item details</SectionLabel>
          <Input
            label="Name *"
            placeholder="e.g. Butter Chicken"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            error={errors.name}
            icon={ChefHat}
          />
          <Textarea
            label="Description"
            placeholder="Brief description — what makes it special?"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            rows={2}
          />
        </section>

        {/* ── Pricing ── */}
        <section className="space-y-3">
          <SectionLabel>Pricing</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Base Price (₹) *"
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setField('price', e.target.value)}
              error={errors.price}
              icon={IndianRupee}
            />
            <Input
              label="Image URL"
              placeholder="https://…"
              value={form.image_url}
              onChange={(e) => setField('image_url', e.target.value)}
              icon={ImageIcon}
            />
          </div>

          {/* Variants */}
          <div
            className="rounded-xl p-3 space-y-2"
            style={{ background: 'var(--accentlt)', border: '1.5px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                  Size / Portion Variants
                </p>
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                  style={{ background: 'var(--border)', color: 'var(--text2)' }}
                >
                  Optional
                </span>
              </div>
              {form.variants.length < MAX_VARIANTS_PER_ITEM && (
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1 text-xs font-bold transition"
                  style={{ color: 'var(--accent)' }}
                >
                  <Plus size={12} /> Add size
                </button>
              )}
            </div>

            {form.variants.length === 0 && (
              <p className="text-[11px]" style={{ color: 'var(--text2)' }}>
                e.g. Half / Full, Regular / Large, Small / Medium / Large
              </p>
            )}

            {form.variants.length > 0 && (
              <div className="space-y-2 pt-1">
                {form.variants.map((variant, i) => (
                  <div
                    key={variant.id}
                    className="flex
                      flex-col
                      gap-2
                      sm:flex-row
                      sm:items-center"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span
                        className=" text-center py-2 rounded-lg px-3 text-[12px] font-semibold flex-shrink-0"
                        style={{ color: '#ffffff', background: 'var(--accent)' }}
                      >
                        {i + 1}
                      </span>

                      <input
                        placeholder="Half"
                        value={variant.label}
                        onChange={(e) =>
                          updateVariant(variant.id, {
                            label: e.target.value,
                          })
                        }
                        className="
                            flex-1
                            h-10
                            px-3
                            rounded-xl
                            text-sm
                            outline-none
                          "
                        style={{
                          border: '1.5px solid var(--border)',
                          background: 'var(--card)',
                          color: 'var(--text)',
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2 sm:w-auto">
                      <div
                        className="
                            flex
                            items-center
                            h-10
                            w-32
                            px-3
                            rounded-xl
                            flex-1
                            sm:flex-none
                            sm:w-32
                          "
                        style={{
                          border: '1.5px solid var(--border)',
                          background: 'var(--card)',
                        }}
                      >
                        <span
                          className="mr-2 text-sm font-semibold"
                          style={{ color: 'var(--text2)' }}
                        >
                          ₹
                        </span>

                        <input
                          placeholder="0.00"
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.price || ''}
                          onChange={(e) =>
                            updateVariant(variant.id, {
                              price:
                                Number(e.target.value) || 0,
                            })
                          }
                          className="
                            w-full
                            bg-transparent
                            outline-none
                            text-sm
                          "
                          style={{
                            color: 'var(--text)',
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeVariant(variant.id)
                        }
                        className="
                                w-9
                                h-9
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                flex-shrink-0
                              "
                        style={{
                          color: '#ffffff', background: 'var(--accent)'
                        }}
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.variants && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <Info size={11} /> {errors.variants}
              </p>
            )}
          </div>
        </section>

      </div >
      <div className='space-y-4'>

        {/* ── Classification ── */}
        <section className="space-y-4">
          <SectionLabel>Classification</SectionLabel>

          {/* Dietary type */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>
              Dietary type
            </p>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(DIETARY_META) as DietaryType[]).map((key) => {
                const meta = DIETARY_META[key];
                const active = form.dietary_type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setField('dietary_type', active ? '' : key)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition"
                    style={{
                      border: `1.5px solid ${active ? meta.ring : 'var(--border)'}`,
                      background: active ? 'var(--card)' : 'transparent',
                      color: active ? meta.ring : 'var(--text2)',
                      boxShadow: active ? `0 0 0 2px ${meta.ring}22` : 'none',
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: meta.dot }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: meta.dot }}
                      />
                    </span>
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {isAdvanceCategory && (
            <>
              {/* Tags */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  Tags
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(TAG_META) as ItemTag[]).map((key) => {
                    const meta = TAG_META[key];
                    const active = form.tags.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleTag(key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                        style={{
                          border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                          background: active ? 'var(--accentlt)' : 'transparent',
                          color: active ? 'var(--accent)' : 'var(--text2)',
                        }}
                      >
                        <span>{meta.emoji}</span>
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Spicy level */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  Spice Level
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(SPICE_LEVEL_META) as SpiceLevel[]).map((key) => {
                    const meta = SPICE_LEVEL_META[key];
                    const active = form.spice_level === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setField('spice_level', active ? '' : key)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                        style={{
                          border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                          background: active ? 'var(--accentlt)' : 'transparent',
                          color: active ? 'var(--accent)' : 'var(--text2)',
                        }}
                      >
                        <span>{meta.emoji}</span>
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </section>

        {isAdvanceCategory && (

          < section
            className="rounded-xl p-3 flex items-center justify-between gap-3"
            style={{ background: 'var(--accentlt)', border: '1.5px solid var(--border)' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Available for ordering
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                Hidden items won&apos;t appear on the customer menu
              </p>
            </div>
            <Toggle
              checked={form.is_available}
              onChange={(v) => setField('is_available', v)}
            />
          </section>
        )}


        {/* ── Submit ── */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="primary" loading={loading} onClick={handleSubmit}>
            {initial?.id ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </div>
    </div >
  );
}