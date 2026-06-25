'use client';

/**
 * CustomizationPanel.tsx
 * Console panel for menu appearance & theme settings.
 *
 * Usage: drop into ConsoleShell's Panel switch as case 'customization'
 * and import wherever you place settings navigation.
 *
 * Reads / writes: public.menu_customizations (upsert on hotel_id)
 * Reads plan gates: custom_branding, advanced_customization from AppContext
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Palette, Type, Layout, Eye, EyeOff, Check,
    Loader2, Sparkles, Lock, RotateCcw, Save,
    ChevronDown, Monitor, Smartphone, Sun, Moon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSupabaseClient } from '../../../lib/supabase/client';
import { useApp } from '../../../context/AppContext';

// ─── Types ─────────────────────────────────────────────────────────────────────

type FontFamily = 'inter' | 'dm_sans' | 'instrument_sans' | 'syne';
type MenuLayout = 'card' | 'list' | 'compact';
type CategoryStyle = 'pill' | 'underline' | 'card';
type ShadowIntensity = 'none' | 'soft' | 'medium' | 'strong';

interface MenuCustomization {
    id?: string;
    hotel_id: string;
    primary_color: string;
    background_color: string;
    surface_color: string;
    text_color: string;
    accent_color: string;
    muted_color: string;
    font_family: FontFamily;
    base_font_size: number;
    heading_weight: number;
    border_radius: number;
    shadow_intensity: ShadowIntensity;
    menu_layout: MenuLayout;
    category_style: CategoryStyle;
    show_logo: boolean;
    show_cover_image: boolean;
    show_ratings: boolean;
    show_address: boolean;
    show_search: boolean;
    show_categories: boolean;
    show_item_images: boolean;
    show_descriptions: boolean;
    show_tags: boolean;
    show_spice_level: boolean;
    show_serving_size: boolean;
    show_dietary_badge: boolean;
    show_scanify_badge: boolean;
}

// ─── Predefined Themes ─────────────────────────────────────────────────────────

interface PresetTheme {
    id: string;
    name: string;
    emoji: string;
    description: string;
    palette: {
        primary_color: string;
        background_color: string;
        surface_color: string;
        text_color: string;
        accent_color: string;
        muted_color: string;
    };
    typography: {
        font_family: FontFamily;
        border_radius: number;
        shadow_intensity: ShadowIntensity;
    };
}

const PRESET_THEMES: PresetTheme[] = [
    {
        id: 'ember',
        name: 'Ember',
        emoji: '🔥',
        description: 'Warm terracotta — Scanify default',
        palette: {
            primary_color: '#C8622A',
            background_color: '#FAF7F2',
            surface_color: '#FFFFFF',
            text_color: '#1C1008',
            accent_color: '#C8622A',
            muted_color: '#A08870',
        },
        typography: { font_family: 'inter', border_radius: 12, shadow_intensity: 'soft' },
    },
    {
        id: 'midnight',
        name: 'Midnight',
        emoji: '🌑',
        description: 'Ink black with gold luxury accents',
        palette: {
            primary_color: '#B8972A',
            background_color: '#0E0E0E',
            surface_color: '#1A1A1A',
            text_color: '#F5F0E8',
            accent_color: '#D4AF37',
            muted_color: '#6B6B6B',
        },
        typography: { font_family: 'syne', border_radius: 8, shadow_intensity: 'strong' },
    },
    {
        id: 'sage',
        name: 'Sage Garden',
        emoji: '🌿',
        description: 'Earthy greens, perfect for farm-to-table',
        palette: {
            primary_color: '#4A7C59',
            background_color: '#F4F7F2',
            surface_color: '#FFFFFF',
            text_color: '#1A2B1E',
            accent_color: '#4A7C59',
            muted_color: '#7A9680',
        },
        typography: { font_family: 'dm_sans', border_radius: 14, shadow_intensity: 'soft' },
    },
    {
        id: 'ocean',
        name: 'Ocean Blue',
        emoji: '🌊',
        description: 'Cool Mediterranean coastal vibes',
        palette: {
            primary_color: '#1E6FA8',
            background_color: '#F0F6FC',
            surface_color: '#FFFFFF',
            text_color: '#0D2137',
            accent_color: '#1E6FA8',
            muted_color: '#5E8FAA',
        },
        typography: { font_family: 'instrument_sans', border_radius: 16, shadow_intensity: 'soft' },
    },
    {
        id: 'rose',
        name: 'Rose Petal',
        emoji: '🌸',
        description: 'Soft blush tones for cafés & bakeries',
        palette: {
            primary_color: '#C2557A',
            background_color: '#FDF5F7',
            surface_color: '#FFFFFF',
            text_color: '#2D0A14',
            accent_color: '#C2557A',
            muted_color: '#A07080',
        },
        typography: { font_family: 'instrument_sans', border_radius: 20, shadow_intensity: 'soft' },
    },
    {
        id: 'slate',
        name: 'Slate Pro',
        emoji: '🪨',
        description: 'Minimal grey — works for any cuisine',
        palette: {
            primary_color: '#3B4A6B',
            background_color: '#F8F9FC',
            surface_color: '#FFFFFF',
            text_color: '#1A1F2E',
            accent_color: '#3B4A6B',
            muted_color: '#6B7280',
        },
        typography: { font_family: 'dm_sans', border_radius: 10, shadow_intensity: 'none' },
    },
    {
        id: 'spice',
        name: 'Saffron Spice',
        emoji: '🌶️',
        description: 'Bold Indian spice market palette',
        palette: {
            primary_color: '#D97706',
            background_color: '#FFFBF0',
            surface_color: '#FFFFFF',
            text_color: '#1C1008',
            accent_color: '#D97706',
            muted_color: '#92680A',
        },
        typography: { font_family: 'syne', border_radius: 12, shadow_intensity: 'medium' },
    },
    {
        id: 'charcoal',
        name: 'Charcoal',
        emoji: '🖤',
        description: 'High contrast monochrome editorial',
        palette: {
            primary_color: '#111111',
            background_color: '#FAFAFA',
            surface_color: '#FFFFFF',
            text_color: '#111111',
            accent_color: '#111111',
            muted_color: '#737373',
        },
        typography: { font_family: 'inter', border_radius: 4, shadow_intensity: 'none' },
    },
];

// ─── Default config ─────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: Omit<MenuCustomization, 'id' | 'hotel_id'> = {
    primary_color: '#C8622A',
    background_color: '#FAF7F2',
    surface_color: '#FFFFFF',
    text_color: '#1C1008',
    accent_color: '#C8622A',
    muted_color: '#A08870',
    font_family: 'inter',
    base_font_size: 16,
    heading_weight: 700,
    border_radius: 12,
    shadow_intensity: 'soft',
    menu_layout: 'card',
    category_style: 'pill',
    show_logo: true,
    show_cover_image: true,
    show_ratings: true,
    show_address: true,
    show_search: true,
    show_categories: true,
    show_item_images: true,
    show_descriptions: true,
    show_tags: true,
    show_spice_level: true,
    show_serving_size: true,
    show_dietary_badge: true,
    show_scanify_badge: true,
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function lightenHex(hex: string, amount = 0.9) {
    const r = Math.round(parseInt(hex.slice(1, 3), 16) + (255 - parseInt(hex.slice(1, 3), 16)) * amount);
    const g = Math.round(parseInt(hex.slice(3, 5), 16) + (255 - parseInt(hex.slice(3, 5), 16)) * amount);
    const b = Math.round(parseInt(hex.slice(5, 7), 16) + (255 - parseInt(hex.slice(5, 7), 16)) * amount);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) {
    return (
        <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'var(--accentlt)' }}>
                <Icon size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
                <h3 className="font-syne font-bold text-sm text-theme">{title}</h3>
                {description && <p className="text-xs text-theme2 mt-0.5">{description}</p>}
            </div>
        </div>
    );
}

function ColorSwatch({ label, value, onChange, disabled }: {
    label: string; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-theme2">{label}</span>
            <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition hover:scale-105"
                    style={{ borderColor: 'var(--border2)' }}>
                    <input
                        type="color"
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        disabled={disabled}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    />
                    <div className="w-full h-full" style={{ background: value }} />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
                    disabled={disabled}
                    maxLength={7}
                    className="flex-1 px-3 py-1.5 rounded-xl border text-xs font-mono text-theme bg-card outline-none focus:ring-2"
                    style={{ borderColor: 'var(--border)', '--tw-ring-color': 'var(--accent)' } as any}
                />
            </div>
        </div>
    );
}

function Toggle({ checked, onChange, label, sublabel, disabled, locked }: {
    checked: boolean; onChange: (v: boolean) => void; label: string; sublabel?: string; disabled?: boolean; locked?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-3 px-4 rounded-xl transition hover:bg-theme3 cursor-pointer"
            onClick={() => !disabled && !locked && onChange(!checked)}>
            <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-theme">{label}</span>
                    {locked && <Lock size={11} style={{ color: 'var(--text3)' }} />}
                </div>
                {sublabel && <p className="text-xs text-theme2 mt-0.5">{sublabel}</p>}
            </div>
            <div className={`relative w-10 h-5.5 rounded-full flex-shrink-0 transition-colors duration-200 ${disabled || locked ? 'opacity-40' : ''}`}
                style={{ background: checked ? 'var(--accent)' : 'var(--bg3)', width: 40, height: 22 }}>
                <div className="absolute top-[3px] transition-transform duration-200 w-4 h-4 rounded-full bg-white shadow"
                    style={{ transform: `translateX(${checked ? 20 : 3}px)` }} />
            </div>
        </div>
    );
}

function SelectPicker({ label, value, onChange, options, disabled }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-theme2">{label}</span>
            <div className="relative">
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled}
                    className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border text-sm text-theme bg-card outline-none focus:ring-2 transition"
                    style={{ borderColor: 'var(--border)', '--tw-ring-color': 'var(--accent)' } as any}
                >
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text3)' }} />
            </div>
        </div>
    );
}

function RangeSlider({ label, value, min, max, step = 1, unit = '', onChange, disabled }: {
    label: string; value: number; min: number; max: number; step?: number;
    unit?: string; onChange: (v: number) => void; disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-theme2">{label}</span>
                <span className="text-xs font-bold text-theme bg-theme3 px-2 py-0.5 rounded-md">
                    {value}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min} max={max} step={step}
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                disabled={disabled}
                className="w-full accent-[var(--accent)]"
                style={{ accentColor: 'var(--accent)' }}
            />
        </div>
    );
}

// ─── Live Preview ───────────────────────────────────────────────────────────────

function LivePreview({ config, hotelName }: { config: Omit<MenuCustomization, 'id' | 'hotel_id'>; hotelName: string }) {
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
    const accentLt = lightenHex(config.accent_color, 0.88);
    const borderColor = hexToRgba(config.text_color, 0.08);

    const fontMap: Record<FontFamily, string> = {
        inter: "'Inter', sans-serif",
        dm_sans: "'DM Sans', sans-serif",
        instrument_sans: "'Instrument Sans', sans-serif",
        syne: "'Syne', sans-serif",
    };

    const borderRadiusMap: Record<ShadowIntensity, string> = {
        none: 'none',
        soft: '0 2px 12px rgba(0,0,0,0.07)',
        medium: '0 4px 20px rgba(0,0,0,0.12)',
        strong: '0 8px 32px rgba(0,0,0,0.2)',
    };

    const previewStyle = {
        '--preview-bg': config.background_color,
        '--preview-surface': config.surface_color,
        '--preview-text': config.text_color,
        '--preview-accent': config.accent_color,
        '--preview-accentlt': accentLt,
        '--preview-muted': config.muted_color,
        '--preview-border': borderColor,
        '--preview-font': fontMap[config.font_family],
        '--preview-radius': `${config.border_radius}px`,
        '--preview-shadow': borderRadiusMap[config.shadow_intensity],
    } as React.CSSProperties;

    return (
        <div className="sticky top-6">
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                {/* Preview toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
                    <span className="text-xs font-bold text-theme2 flex items-center gap-1.5">
                        <Eye size={12} /> Live Preview
                    </span>
                    <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: 'var(--border)' }}>
                        {([['mobile', Smartphone], ['desktop', Monitor]] as const).map(([mode, Icon]) => (
                            <button key={mode} onClick={() => setPreviewMode(mode)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all"
                                style={{
                                    background: previewMode === mode ? 'var(--card)' : 'transparent',
                                    color: previewMode === mode ? 'var(--text)' : 'var(--text3)',
                                }}>
                                <Icon size={11} /> {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Phone/Desktop frame */}
                <div className="p-4 flex justify-center" style={{ background: 'var(--bg3)' }}>
                    <div
                        className={`overflow-hidden transition-all duration-300 ${previewMode === 'mobile' ? 'w-[280px]' : 'w-full'}`}
                        style={{
                            ...previewStyle,
                            borderRadius: previewMode === 'mobile' ? '24px' : '12px',
                            border: previewMode === 'mobile' ? '8px solid #1C1008' : '1px solid var(--border2)',
                            maxHeight: '480px',
                            overflow: 'hidden',
                        }}>
                        <div style={{ background: 'var(--preview-bg)', fontFamily: 'var(--preview-font)', maxHeight: 480, overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ padding: '16px 14px 12px', borderBottom: `1px solid var(--preview-border)` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    {config.show_logo && (
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 'calc(var(--preview-radius) - 2px)',
                                            background: 'var(--preview-accentlt)', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <span style={{ color: 'var(--preview-accent)', fontWeight: 700, fontSize: 14 }}>
                                                {hotelName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <div style={{ fontWeight: config.heading_weight, fontSize: config.base_font_size * 0.9, color: 'var(--preview-text)', lineHeight: 1.2 }}>
                                            {hotelName}
                                        </div>
                                        {config.show_address && (
                                            <div style={{ fontSize: 10, color: 'var(--preview-muted)', marginTop: 2 }}>
                                                📍 123, Sample Street
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {config.show_search && (
                                    <div style={{
                                        background: 'var(--preview-surface)',
                                        border: `1px solid var(--preview-border)`,
                                        borderRadius: 'var(--preview-radius)',
                                        padding: '7px 12px',
                                        fontSize: 11,
                                        color: 'var(--preview-muted)',
                                        boxShadow: 'var(--preview-shadow)',
                                    }}>
                                        🔍 Search dishes, drinks…
                                    </div>
                                )}
                            </div>

                            {/* Category pills */}
                            {config.show_categories && (
                                <div style={{
                                    display: 'flex', gap: 6, padding: '10px 14px',
                                    borderBottom: `1px solid var(--preview-border)`,
                                    overflowX: 'hidden',
                                }}>
                                    {['Starters', 'Mains', 'Drinks', 'Desserts'].map((cat, i) => (
                                        <div key={cat} style={{
                                            padding: '4px 10px',
                                            borderRadius: config.category_style === 'pill' ? 99 : config.border_radius,
                                            background: i === 0 ? 'var(--preview-accent)' : 'transparent',
                                            color: i === 0 ? '#fff' : 'var(--preview-muted)',
                                            border: `1px solid ${i === 0 ? 'var(--preview-accent)' : 'var(--preview-border)'}`,
                                            fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                                        }}>
                                            {cat}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Menu items */}
                            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { name: 'Paneer Tikka', price: 220, tag: 'veg', desc: 'Soft cottage cheese marinated in spices' },
                                    { name: 'Chicken Wings', price: 340, tag: 'non-veg', desc: 'Crispy wings with house sauce' },
                                ].map((item) => (
                                    <div key={item.name} style={{
                                        display: 'flex', gap: 8, padding: 10,
                                        background: 'var(--preview-surface)',
                                        borderRadius: 'var(--preview-radius)',
                                        border: `1px solid var(--preview-border)`,
                                        boxShadow: 'var(--preview-shadow)',
                                    }}>
                                        {config.show_item_images && (
                                            <div style={{
                                                width: 52, height: 52, borderRadius: `calc(var(--preview-radius) - 4px)`,
                                                background: 'var(--preview-accentlt)',
                                                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 20,
                                            }}>
                                                {item.tag === 'veg' ? '🥗' : '🍗'}
                                            </div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                                                {config.show_dietary_badge && (
                                                    <div style={{
                                                        width: 12, height: 12, borderRadius: 2,
                                                        border: `1.5px solid ${item.tag === 'veg' ? '#16a34a' : '#dc2626'}`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <div style={{
                                                            width: 5, height: 5, borderRadius: '50%',
                                                            background: item.tag === 'veg' ? '#16a34a' : '#dc2626',
                                                        }} />
                                                    </div>
                                                )}
                                                <span style={{ fontSize: 11, fontWeight: config.heading_weight, color: 'var(--preview-text)' }}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            {config.show_descriptions && (
                                                <p style={{ fontSize: 9, color: 'var(--preview-muted)', marginBottom: 4, lineHeight: 1.4 }}>
                                                    {item.desc}
                                                </p>
                                            )}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--preview-accent)' }}>₹{item.price}</span>
                                                {config.show_tags && (
                                                    <span style={{
                                                        fontSize: 8, padding: '2px 6px',
                                                        borderRadius: 99, background: 'var(--preview-accentlt)',
                                                        color: 'var(--preview-accent)', fontWeight: 600,
                                                    }}>
                                                        Popular
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            {config.show_scanify_badge && (
                                <div style={{
                                    borderTop: `1px solid var(--preview-border)`,
                                    padding: '8px 14px',
                                    display: 'flex', justifyContent: 'center',
                                }}>
                                    <span style={{
                                        fontSize: 9, padding: '3px 10px',
                                        borderRadius: 99, background: 'var(--preview-accentlt)',
                                        color: 'var(--preview-accent)', fontWeight: 600,
                                        border: `1px solid var(--preview-accent)`,
                                    }}>
                                        ◼ Powered by Scanify
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Theme Card ─────────────────────────────────────────────────────────────────

function ThemeCard({ theme, isActive, onApply }: { theme: PresetTheme; isActive: boolean; onApply: () => void }) {
    return (
        <button
            onClick={onApply}
            className="group relative flex-shrink-0 text-left transition-all duration-200 hover:-translate-y-0.5"
            style={{ width: '100%' }}
        >
            <div className="rounded-2xl border-2 overflow-hidden transition-all duration-200"
                style={{
                    borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                    background: theme.palette.surface_color,
                    boxShadow: isActive ? '0 0 0 4px var(--accentlt)' : 'none',
                }}>
                {/* Palette strip */}
                <div className="flex h-8">
                    {[theme.palette.background_color, theme.palette.accent_color, theme.palette.text_color, theme.palette.muted_color].map((c, i) => (
                        <div key={i} className="flex-1" style={{ background: c }} />
                    ))}
                </div>

                {/* Mini item preview */}
                <div className="p-2.5" style={{ background: theme.palette.background_color }}>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px]"
                            style={{ background: lightenHex(theme.palette.accent_color, 0.88) }}>
                            {theme.emoji}
                        </div>
                        <div className="flex-1">
                            <div className="h-1.5 rounded-full mb-1" style={{ background: theme.palette.text_color, width: '60%' }} />
                            <div className="h-1 rounded-full" style={{ background: theme.palette.muted_color, width: '40%', opacity: 0.6 }} />
                        </div>
                        <div className="text-[9px] font-bold" style={{ color: theme.palette.accent_color }}>₹220</div>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: theme.palette.accent_color, width: '30%' }} />
                </div>
            </div>

            {/* Label */}
            <div className="mt-1.5 px-0.5 flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold text-theme leading-tight">{theme.name}</p>
                    <p className="text-[10px] text-theme2 leading-tight mt-0.5">{theme.description}</p>
                </div>
                {isActive && (
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: 'var(--accent)' }}>
                        <Check size={9} color="white" />
                    </div>
                )}
            </div>
        </button>
    );
}

// ─── Plan Gate ──────────────────────────────────────────────────────────────────

function PlanGate({ children, locked, label = 'Pro' }: { children: React.ReactNode; locked: boolean; label?: string }) {
    if (!locked) return <>{children}</>;
    return (
        <div className="relative">
            <div className="pointer-events-none opacity-40 select-none">{children}</div>
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-10"
                style={{ background: 'rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-lg"
                    style={{ background: 'var(--accent)' }}>
                    <Lock size={11} /> Unlock with {label}
                </div>
            </div>
        </div>
    );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────────

export default function CustomizationPanel() {
    const supabase = getSupabaseClient();
    const { hotel, customBranding, advancedCustom } = useApp();

    const [config, setConfig] = useState<Omit<MenuCustomization, 'id' | 'hotel_id'>>(DEFAULT_CONFIG);
    const [existingId, setExistingId] = useState<string | null>(null);
    const [activeThemeId, setActiveThemeId] = useState<string | null>('ember');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'typography' | 'layout' | 'visibility'>('themes');

    // Load existing customization
    useEffect(() => {
        if (!hotel?.id) return;
        (async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('menu_customizations')
                .select('*')
                .eq('hotel_id', hotel.id)
                .maybeSingle();

            if (data && !error) {
                const { id, hotel_id, ...rest } = data;
                setConfig(rest as any);
                setExistingId(id);
                // Detect if matches a preset
                const matched = PRESET_THEMES.find(t =>
                    t.palette.accent_color === data.accent_color &&
                    t.palette.background_color === data.background_color
                );
                setActiveThemeId(matched?.id ?? null);
            }
            setLoading(false);
        })();
    }, [hotel?.id]);

    const update = useCallback(<K extends keyof typeof config>(key: K, value: typeof config[K]) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setIsDirty(true);
        // Deselect preset if manually editing colors
        if (['primary_color', 'background_color', 'surface_color', 'text_color', 'accent_color', 'muted_color'].includes(key)) {
            setActiveThemeId(null);
        }
    }, []);

    function applyTheme(theme: PresetTheme) {
        setConfig(prev => ({
            ...prev,
            ...theme.palette,
            primary_color: theme.palette.accent_color,
            ...theme.typography,
        }));
        setActiveThemeId(theme.id);
        setIsDirty(true);
    }

    async function save() {
        if (!hotel?.id) return;
        setSaving(true);
        try {
            const payload = { ...config, hotel_id: hotel.id };
            // Ensure category_style is one of the DB-allowed values
            const allowedCategoryStyles = ['card', 'pill', 'underline'];
            const dbPayload = {
                ...payload,
                category_style: allowedCategoryStyles.includes(payload.category_style as any)
                    ? payload.category_style
                    : 'card',
            } as any;

            let error;
            if (existingId) {
                ({ error } = await supabase.from('menu_customizations').update(dbPayload).eq('id', existingId));
            } else {
                const { data, error: e } = await supabase.from('menu_customizations').insert(dbPayload).select('id').single();
                error = e;
                if (data) setExistingId(data.id);
            }
            if (error) throw error;
            toast.success('Menu customization saved!');
            setIsDirty(false);
        } catch (err: any) {
            toast.error(err.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    }

    function resetToDefault() {
        setConfig(DEFAULT_CONFIG);
        setActiveThemeId('ember');
        setIsDirty(true);
    }

    const TABS = [
        { id: 'themes', label: 'Themes', icon: Sparkles },
        { id: 'colors', label: 'Colors', icon: Palette },
        { id: 'typography', label: 'Typography', icon: Type },
        { id: 'layout', label: 'Layout', icon: Layout },
        { id: 'visibility', label: 'Visibility', icon: Eye },
    ] as const;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={28} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0 h-full">
            {/* ── Top bar ───────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-20 bg-theme"
                style={{ borderColor: 'var(--border)' }}>
                <div>
                    <h2 className="font-syne font-bold text-base text-theme">Menu Appearance</h2>
                    <p className="text-xs text-theme2 mt-0.5">Customize how your digital menu looks to customers</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={resetToDefault}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition hover:bg-theme3"
                        style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
                        <RotateCcw size={12} /> Reset
                    </button>
                    <button
                        onClick={save}
                        disabled={!isDirty || saving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition disabled:opacity-50"
                        style={{ background: isDirty ? 'var(--accent)' : 'var(--text3)' }}>
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* ── Body: settings left, preview right ───────────────────────────── */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-0 overflow-hidden">

                {/* Left: editor */}
                <div className="overflow-y-auto">
                    {/* Tab nav */}
                    <div className="flex gap-1 px-6 pt-5 pb-0 border-b overflow-x-auto scrollbar-hide"
                        style={{ borderColor: 'var(--border)' }}>
                        {TABS.map(({ id, label, icon: Icon }) => {
                            const active = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id as any)}
                                    className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap"
                                    style={{
                                        borderColor: active ? 'var(--accent)' : 'transparent',
                                        color: active ? 'var(--accent)' : 'var(--text2)',
                                    }}>
                                    <Icon size={12} />
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-6 space-y-8 pb-24">

                        {/* ── THEMES TAB ────────────────────────────────────────────── */}
                        {activeTab === 'themes' && (
                            <div>
                                <SectionHeader icon={Sparkles} title="Preset Themes"
                                    description="Pick a theme to instantly set colors, typography, and border style. You can fine-tune in the other tabs." />

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {PRESET_THEMES.map(theme => (
                                        <ThemeCard
                                            key={theme.id}
                                            theme={theme}
                                            isActive={activeThemeId === theme.id}
                                            onApply={() => applyTheme(theme)}
                                        />
                                    ))}
                                </div>

                                {activeThemeId === null && (
                                    <div className="mt-4 p-3 rounded-xl text-xs text-theme2 border flex items-center gap-2"
                                        style={{ borderColor: 'var(--border)', background: 'var(--accentlt)' }}>
                                        <Palette size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                        Custom colors applied — switch to Colors tab to edit manually.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── COLORS TAB ────────────────────────────────────────────── */}
                        {activeTab === 'colors' && (
                            <PlanGate locked={!customBranding}>
                                <div>
                                    <SectionHeader icon={Palette} title="Color Palette"
                                        description="Set exact brand colors for your menu. Changes override the active theme." />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <ColorSwatch label="Accent / Brand Color" value={config.accent_color}
                                            onChange={v => { update('accent_color', v); update('primary_color', v); }} />
                                        <ColorSwatch label="Background" value={config.background_color}
                                            onChange={v => update('background_color', v)} />
                                        <ColorSwatch label="Card Surface" value={config.surface_color}
                                            onChange={v => update('surface_color', v)} />
                                        <ColorSwatch label="Primary Text" value={config.text_color}
                                            onChange={v => update('text_color', v)} />
                                        <ColorSwatch label="Muted / Secondary Text" value={config.muted_color}
                                            onChange={v => update('muted_color', v)} />
                                    </div>

                                    <div className="mt-4 p-3 rounded-xl text-xs text-theme2 border"
                                        style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
                                        💡 Accent color drives buttons, tags, prices, and category pills — choose it carefully.
                                    </div>
                                </div>
                            </PlanGate>
                        )}

                        {/* ── TYPOGRAPHY TAB ────────────────────────────────────────── */}
                        {activeTab === 'typography' && (
                            <PlanGate locked={!advancedCustom}>
                                <div>
                                    <SectionHeader icon={Type} title="Typography & Shape"
                                        description="Control fonts, sizes, weights, and corner radius." />

                                    <div className="space-y-5">
                                        <SelectPicker label="Font Family" value={config.font_family}
                                            onChange={v => update('font_family', v as FontFamily)}
                                            options={[
                                                { value: 'inter', label: 'Inter — clean & modern' },
                                                { value: 'dm_sans', label: 'DM Sans — geometric friendly' },
                                                { value: 'instrument_sans', label: 'Instrument Sans — editorial' },
                                                { value: 'syne', label: 'Syne — bold display' },
                                            ]} />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <RangeSlider label="Base Font Size" value={config.base_font_size}
                                                min={13} max={20} unit="px"
                                                onChange={v => update('base_font_size', v)} />
                                            <RangeSlider label="Heading Weight" value={config.heading_weight}
                                                min={400} max={900} step={100}
                                                onChange={v => update('heading_weight', v)} />
                                        </div>

                                        <RangeSlider label="Border Radius" value={config.border_radius}
                                            min={0} max={28} unit="px"
                                            onChange={v => update('border_radius', v)} />

                                        <SelectPicker label="Shadow Intensity" value={config.shadow_intensity}
                                            onChange={v => update('shadow_intensity', v as ShadowIntensity)}
                                            options={[
                                                { value: 'none', label: 'None — flat design' },
                                                { value: 'soft', label: 'Soft — subtle depth' },
                                                { value: 'medium', label: 'Medium — clear layers' },
                                                { value: 'strong', label: 'Strong — dramatic' },
                                            ]} />
                                    </div>
                                </div>
                            </PlanGate>
                        )}

                        {/* ── LAYOUT TAB ────────────────────────────────────────────── */}
                        {activeTab === 'layout' && (
                            <div>
                                <SectionHeader icon={Layout} title="Menu Layout"
                                    description="Control how items and categories are presented." />

                                <div className="space-y-5">
                                    {/* Layout picker with visual cards */}
                                    <div>
                                        <p className="text-xs font-medium text-theme2 mb-2.5">Item Layout</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {([
                                                { value: 'card', label: 'Card', icon: '▦', desc: 'Image + details in card' },
                                                { value: 'list', label: 'List', icon: '☰', desc: 'Horizontal row layout' },
                                                { value: 'compact', label: 'Compact', icon: '≡', desc: 'Dense text-first' },
                                            ] as const).map(opt => (
                                                <button key={opt.value}
                                                    onClick={() => update('menu_layout', opt.value)}
                                                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all"
                                                    style={{
                                                        borderColor: config.menu_layout === opt.value ? 'var(--accent)' : 'var(--border)',
                                                        background: config.menu_layout === opt.value ? 'var(--accentlt)' : 'var(--card)',
                                                    }}>
                                                    <span className="text-2xl">{opt.icon}</span>
                                                    <span className="text-xs font-bold text-theme">{opt.label}</span>
                                                    <span className="text-[9px] text-theme2 text-center leading-tight">{opt.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Category style */}
                                    <div>
                                        <p className="text-xs font-medium text-theme2 mb-2.5">Category Navigation Style</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {([
                                                { value: 'pill', label: 'Pills', icon: '⬬', desc: 'Horizontal scrollable' },
                                                { value: 'underline', label: 'Tabs', icon: '⊟', desc: 'Full-width bar' },
                                                { value: 'card', label: 'Sidebar', icon: '⊞', desc: 'Left panel list' },
                                            ] as const).map(opt => (
                                                <button key={opt.value}
                                                    onClick={() => update('category_style', opt.value)}
                                                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all"
                                                    style={{
                                                        borderColor: config.category_style === opt.value ? 'var(--accent)' : 'var(--border)',
                                                        background: config.category_style === opt.value ? 'var(--accentlt)' : 'var(--card)',
                                                    }}>
                                                    <span className="text-2xl">{opt.icon}</span>
                                                    <span className="text-xs font-bold text-theme">{opt.label}</span>
                                                    <span className="text-[9px] text-theme2 text-center leading-tight">{opt.desc}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── VISIBILITY TAB ────────────────────────────────────────── */}
                        {activeTab === 'visibility' && (
                            <div>
                                <SectionHeader icon={Eye} title="Element Visibility"
                                    description="Show or hide individual sections of the menu page." />

                                <div className="space-y-0 rounded-2xl border overflow-hidden"
                                    style={{ borderColor: 'var(--border)' }}>
                                    <p className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-theme3"
                                        style={{ background: 'var(--bg3)' }}>
                                        Header
                                    </p>
                                    <Toggle checked={config.show_logo} onChange={v => update('show_logo', v)}
                                        label="Restaurant Logo" sublabel="Shows brand logo in the header" />
                                    <Toggle checked={config.show_cover_image} onChange={v => update('show_cover_image', v)}
                                        label="Cover Image" sublabel="Hero banner at the top" />
                                    <Toggle checked={config.show_address} onChange={v => update('show_address', v)}
                                        label="Address" sublabel="Location below restaurant name" />
                                    <Toggle checked={config.show_ratings} onChange={v => update('show_ratings', v)}
                                        label="Star Rating" sublabel="Average rating with review count" />
                                    <Toggle checked={config.show_search} onChange={v => update('show_search', v)}
                                        label="Search Bar" sublabel="Lets customers search by dish name" />

                                    <p className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-theme3"
                                        style={{ background: 'var(--bg3)' }}>
                                        Navigation
                                    </p>
                                    <Toggle checked={config.show_categories} onChange={v => update('show_categories', v)}
                                        label="Category Nav" sublabel="Sticky category switcher bar" />

                                    <p className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-theme3"
                                        style={{ background: 'var(--bg3)' }}>
                                        Menu Items
                                    </p>
                                    <Toggle checked={config.show_item_images} onChange={v => update('show_item_images', v)}
                                        label="Item Images" sublabel="Food photography on each card" />
                                    <Toggle checked={config.show_descriptions} onChange={v => update('show_descriptions', v)}
                                        label="Descriptions" sublabel="Short description below item name" />
                                    <Toggle checked={config.show_dietary_badge} onChange={v => update('show_dietary_badge', v)}
                                        label="Veg / Non-Veg Dot" sublabel="FSSAI green/red indicator" />
                                    <Toggle checked={config.show_tags} onChange={v => update('show_tags', v)}
                                        label="Tags & Badges" sublabel="Popular, Spicy, Chef's Special etc." />
                                    <Toggle checked={config.show_spice_level} onChange={v => update('show_spice_level', v)}
                                        label="Spice Level" sublabel="Chilli heat indicator" />
                                    <Toggle checked={config.show_serving_size} onChange={v => update('show_serving_size', v)}
                                        label="Serving Size" sublabel="Portion info on the item card" />

                                    <p className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-theme3"
                                        style={{ background: 'var(--bg3)' }}>
                                        Branding
                                    </p>
                                    <PlanGate locked={!customBranding} label="Pro">
                                        <Toggle
                                            checked={config.show_scanify_badge}
                                            onChange={v => update('show_scanify_badge', v)}
                                            label="Scanify Badge"
                                            sublabel="'Powered by Scanify' in the footer"
                                            locked={!customBranding}
                                        />
                                    </PlanGate>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: live preview */}
                <div className="hidden xl:block border-l p-5 overflow-y-auto"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}>
                    <LivePreview config={config} hotelName={hotel?.name ?? 'Your Restaurant'} />
                </div>
            </div>

            {/* ── Mobile: floating preview toggle ──────────────────────────────── */}
            <div className="xl:hidden fixed bottom-6 right-6 z-50">
                <a
                    href={`/menu/${hotel?.slug ?? ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white shadow-lg"
                    style={{ background: 'var(--accent)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                    <Eye size={14} /> Preview Menu
                </a>
            </div>
        </div>
    );
}