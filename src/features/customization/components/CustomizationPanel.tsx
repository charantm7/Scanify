'use client';

import { useState } from 'react';
import {
    Palette, Type, Layout, Eye,
    Loader2, Sparkles, RotateCcw, Save,

} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { FontFamily, ShadowIntensity } from '../types';
import { PRESET_THEMES } from '../constants';
import { LivePreview } from './LivePreview';
import { SectionHeader } from './SectionHeader';
import { ColorSwatch } from './ColorsWatch';
import { PlanGate } from './PlanGate';
import { Toggle, SelectPicker, RangeSlider, ThemeCard } from './Uiutils';
import { useCustomization } from '../hook/useCustomization';


export default function CustomizationPanel() {
    const { hotel, customBranding, advancedCustom } = useApp();
    const { config, activeThemeId, loading, save, saving, isDirty, applyTheme, resetToDefault, update } = useCustomization();

    const [activeTab, setActiveTab] = useState<'themes' | 'colors' | 'typography' | 'layout' | 'visibility'>('themes');

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
            <div className="flex items-center justify-between px-6 py-4 border rounded-lg" style={{ borderColor: 'var(--border)', background: 'var(--bg3)' }}
            >
                <div>
                    <h2 className="font-syne font-bold text-base text-theme">Menu Appearance</h2>
                    <p className="hidden md:block text-xs text-theme2 mt-0.5">Customize how your digital menu looks to customers</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={resetToDefault}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold border transition hover:bg-theme3"
                        style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}>
                        <RotateCcw size={12} /> Reset
                    </button>
                    <button
                        onClick={save}
                        disabled={!isDirty || saving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold text-white transition disabled:opacity-50"
                        style={{ background: isDirty ? 'var(--accent)' : 'var(--text3)' }}>
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>

            {/* ── Body: settings left, preview right ───────────────────────────── */}
            <div className="flex-1 grid grid-cols-1 gap-0 overflow-hidden">

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

                    <div className="py-6 px-2 space-y-8 pb-24">

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
                                                { value: 'poppins', label: "Poppins" },
                                                { value: 'outfit', label: "Outfit" },
                                                { value: 'playfair', label: "Play Fair" }
                                            ]} />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <RangeSlider label="Base Font Size" value={config.base_font_size}
                                                min={5} max={20} unit="px"
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
                                        <div className="grid  gap-3" style={{
                                            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                                        }}>
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
                                        <div className="grid gap-3" style={{
                                            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                                        }}>
                                            {([
                                                { value: 'pill', label: 'Pills', icon: '⬬', desc: 'Horizontal scrollable' },
                                                { value: 'underline', label: 'Underline', icon: '⊟', desc: 'Full-width bar' },
                                                { value: 'card', label: 'Card', icon: '⊞', desc: 'Left panel list' },
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
                <div className="block overflow-y-auto">
                    <LivePreview config={config} hotelName={hotel?.name ?? 'Your Restaurant'} />
                </div>
            </div>

            {/* ── Mobile: floating preview toggle ──────────────────────────────── */}
            <div className=" fixed bottom-6 right-6 z-50">
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