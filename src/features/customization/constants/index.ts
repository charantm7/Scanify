// features/customization/constants/index.ts
// Preset themes, font options, layout options — single source of truth.

import type { PresetTheme, CustomizationTab } from '../types';

// ── Preset themes ──────────────────────────────────────────────────────────────
// Each preset maps directly to DBMenuCustomization fields.
// Keep colour choices opinionated and named clearly so restaurant owners
// understand what they're picking without needing design knowledge.

export const PRESET_THEMES: PresetTheme[] = [
    {
        id: 'spice_trail',
        name: 'Spice Trail',
        description: 'Warm terracotta on cream — the Scanify default, built for Indian restaurants',
        emoji: '🍛',
        config: {
            primary_color: '#C8622A',
            background_color: '#FAFAF8',
            surface_color: '#FFFFFF',
            text_color: '#1A1A1A',
            accent_color: '#C8622A',
            muted_color: '#6B7280',
            font_family: 'inter',
            border_radius: 12,
            shadow_intensity: 'soft',
            menu_layout: 'card',
            category_style: 'pill',
        },
    },
    {
        id: 'midnight_feast',
        name: 'Midnight Feast',
        description: 'Dark luxe — deep charcoal, gold accents, premium feel',
        emoji: '🌙',
        config: {
            primary_color: '#D4A843',
            background_color: '#111111',
            surface_color: '#1E1E1E',
            text_color: '#F5F0E8',
            accent_color: '#D4A843',
            muted_color: '#8A8A8A',
            font_family: 'syne',
            border_radius: 8,
            shadow_intensity: 'strong',
            menu_layout: 'card',
            category_style: 'underline',
        },
    },
    {
        id: 'garden_fresh',
        name: 'Garden Fresh',
        description: 'Clean green on white — perfect for cafes, health food and salad bars',
        emoji: '🥗',
        config: {
            primary_color: '#2D7A4F',
            background_color: '#F6FAF7',
            surface_color: '#FFFFFF',
            text_color: '#1A2E20',
            accent_color: '#2D7A4F',
            muted_color: '#6B7C6F',
            font_family: 'dm_sans',
            border_radius: 16,
            shadow_intensity: 'soft',
            menu_layout: 'card',
            category_style: 'pill',
        },
    },
    {
        id: 'coastal_blue',
        name: 'Coastal Blue',
        description: 'Ocean blues and sandy whites — ideal for seafood and beach shacks',
        emoji: '🐟',
        config: {
            primary_color: '#1A6FA8',
            background_color: '#F5F9FC',
            surface_color: '#FFFFFF',
            text_color: '#1A2A35',
            accent_color: '#1A6FA8',
            muted_color: '#607D8B',
            font_family: 'outfit',
            border_radius: 14,
            shadow_intensity: 'soft',
            menu_layout: 'grid',
            category_style: 'pill',
        },
    },
    {
        id: 'ember_red',
        name: 'Ember Red',
        description: 'Bold crimson — high energy for BBQs, grills and fast-casual',
        emoji: '🔥',
        config: {
            primary_color: '#C41230',
            background_color: '#FBF7F7',
            surface_color: '#FFFFFF',
            text_color: '#1A0508',
            accent_color: '#C41230',
            muted_color: '#7A5560',
            font_family: 'syne',
            border_radius: 10,
            shadow_intensity: 'medium',
            menu_layout: 'list',
            category_style: 'underline',
        },
    },
    {
        id: 'monochrome',
        name: 'Monochrome',
        description: 'Pure black and white — timeless, editorial, lets the food speak',
        emoji: '⬛',
        config: {
            primary_color: '#111111',
            background_color: '#FAFAFA',
            surface_color: '#FFFFFF',
            text_color: '#111111',
            accent_color: '#111111',
            muted_color: '#888888',
            font_family: 'inter',
            border_radius: 6,
            shadow_intensity: 'none',
            menu_layout: 'list',
            category_style: 'underline',
        },
    },
    {
        id: 'saffron_royal',
        name: 'Saffron Royal',
        description: 'Deep purple and saffron — regal North Indian fine dining',
        emoji: '👑',
        plan: 'starter',
        config: {
            primary_color: '#E8A020',
            background_color: '#1A0A2E',
            surface_color: '#26153D',
            text_color: '#F5EDD8',
            accent_color: '#E8A020',
            muted_color: '#A090B8',
            font_family: 'playfair',
            border_radius: 12,
            shadow_intensity: 'strong',
            menu_layout: 'card',
            category_style: 'card',
        },
    },
    {
        id: 'matcha_zen',
        name: 'Matcha Zen',
        description: 'Sage and stone — minimal Japanese aesthetic for sushi and tea',
        emoji: '🍵',
        plan: 'starter',
        config: {
            primary_color: '#5C7A4E',
            background_color: '#F3F2EE',
            surface_color: '#FAFAF8',
            text_color: '#2A2820',
            accent_color: '#5C7A4E',
            muted_color: '#8A9080',
            font_family: 'dm_sans',
            border_radius: 4,
            shadow_intensity: 'none',
            menu_layout: 'list',
            category_style: 'underline',
        },
    },
];

// ── Font options (matches FontFamily enum) ─────────────────────────────────────
export const FONT_OPTIONS = [
    { value: 'inter', label: 'Inter', preview: 'Clean & readable' },
    { value: 'dm_sans', label: 'DM Sans', preview: 'Modern & friendly' },
    { value: 'poppins', label: 'Poppins', preview: 'Rounded & popular' },
    { value: 'outfit', label: 'Outfit', preview: 'Tech & casual' },
    { value: 'syne', label: 'Syne', preview: 'Bold & editorial' },
    { value: 'playfair', label: 'Playfair Display', preview: 'Elegant & serif' },
] as const;

// ── Layout options ─────────────────────────────────────────────────────────────
export const LAYOUT_OPTIONS = [
    {
        value: 'card',
        label: 'Card',
        description: 'Image + name + price in a card',
        icon: '▦',
    },
    {
        value: 'list',
        label: 'List',
        description: 'Compact rows, best for large menus',
        icon: '≡',
    },
    {
        value: 'grid',
        label: 'Grid',
        description: 'Large image grid, visual-first',
        icon: '⊞',
    },
] as const;

export const CATEGORY_STYLE_OPTIONS = [
    { value: 'pill', label: 'Pill', description: 'Rounded badge tabs' },
    { value: 'underline', label: 'Underline', description: 'Minimal underline tabs' },
    { value: 'card', label: 'Card', description: 'Boxed category cards' },
] as const;

export const SHADOW_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'soft', label: 'Soft' },
    { value: 'medium', label: 'Medium' },
    { value: 'strong', label: 'Strong' },
] as const;

// ── Visibility toggles grouped ─────────────────────────────────────────────────
export const VISIBILITY_GROUPS = [
    {
        group: 'Header',
        items: [
            { key: 'show_logo', label: 'Restaurant logo' },
            { key: 'show_cover_image', label: 'Cover image' },
            { key: 'show_ratings', label: 'Ratings & reviews' },
            { key: 'show_address', label: 'Address' },
        ],
    },
    {
        group: 'Navigation',
        items: [
            { key: 'show_search', label: 'Search bar' },
            { key: 'show_categories', label: 'Category tabs' },
        ],
    },
    {
        group: 'Menu items',
        items: [
            { key: 'show_item_images', label: 'Item images' },
            { key: 'show_descriptions', label: 'Descriptions' },
            { key: 'show_tags', label: 'Tags (Bestseller, New, etc.)' },
            { key: 'show_spice_level', label: 'Spice level indicator' },
            { key: 'show_serving_size', label: 'Serving size' },
            { key: 'show_dietary_badge', label: 'Dietary badges (Veg/Non-Veg)' },
        ],
    },
    {
        group: 'Footer',
        items: [
            { key: 'show_scanify_badge', label: 'Powered by Scanify badge' },
        ],
    },
] as const;

// ── Tab config ─────────────────────────────────────────────────────────────────
export const TABS: { id: CustomizationTab; label: string; description: string }[] = [
    { id: 'theme', label: 'Theme', description: 'Colors and presets' },
    { id: 'layout', label: 'Layout', description: 'Menu structure' },
    { id: 'typography', label: 'Typography', description: 'Fonts and sizing' },
    { id: 'visibility', label: 'Visibility', description: 'Show / hide elements' },
];
