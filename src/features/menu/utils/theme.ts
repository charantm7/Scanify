// features/menu/utils/theme.ts
// ─────────────────────────────────────────────────────────────────────────────
// Converts a DBMenuCustomization into CSS custom properties.
//
// IMPORTANT: the app's globals.css defines its own variable names
// (--bg, --accent, --accentlt, --border, --card, --shadow, --text, --text2).
// The menu components are being migrated to the --color-* namespace, but the
// app body/layout still references the old names.
//
// This theme engine sets BOTH sets so everything resolves correctly:
//   - --color-* → consumed by menu feature components
//   - legacy aliases (--bg, --accent, etc.) → consumed by globals.css class
//     utilities like .bg-theme, .text-accent-t, border-theme, etc.
// ─────────────────────────────────────────────────────────────────────────────

import type { DBMenuCustomization, ThemeTokens } from "../types";
import { FONT_STACKS, SHADOW_MAP, DEFAULT_CUSTOMIZATION } from "../constant";

function hexAlpha(hex: string, alpha: number): string {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function isDark(hex: string): boolean {
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

export function buildThemeTokens(c: Partial<DBMenuCustomization>): ThemeTokens {
    const cfg = { ...DEFAULT_CUSTOMIZATION, ...c } as DBMenuCustomization;
    const shadows = SHADOW_MAP[cfg.shadow_intensity];
    const dark = isDark(cfg.background_color);

    const accentLt = hexAlpha(cfg.accent_color, dark ? 0.18 : 0.10);
    const border = dark ? hexAlpha("#FFFFFF", 0.10) : hexAlpha("#000000", 0.08);
    const border2 = dark ? hexAlpha("#FFFFFF", 0.16) : hexAlpha("#000000", 0.12);
    const muted = dark ? hexAlpha("#FFFFFF", 0.45) : hexAlpha("#000000", 0.45);

    return {
        // ── New --color-* namespace (menu feature components) ────────────────
        "--color-primary": cfg.primary_color,
        "--color-bg": cfg.background_color,
        "--color-surface": cfg.surface_color,
        "--color-text": cfg.text_color,
        "--color-accent": cfg.accent_color,
        "--color-muted": cfg.muted_color,
        "--color-accent-lt": accentLt,
        "--color-border": border,
        "--color-border2": border2,
        "--border-radius": `${cfg.border_radius}px`,
        "--font-family": FONT_STACKS[cfg.font_family],
        "--shadow-sm": shadows.sm,
        "--shadow-md": shadows.md,
        "--shadow-lg": shadows.lg,
        "--font-size": `${cfg.base_font_size}px`,

        // ── Legacy aliases (globals.css utilities: .bg-theme, .text-accent-t, etc.) ──
        "--bg": cfg.background_color,
        "--bg2": cfg.surface_color,
        "--bg3": dark ? hexAlpha("#FFFFFF", 0.06) : hexAlpha("#000000", 0.04),
        "--text": cfg.text_color,
        "--text2": cfg.muted_color,
        "--text3": muted,
        "--accent": cfg.accent_color,
        "--accentlt": accentLt,
        "--card": cfg.surface_color,
        "--border": border,
        "--border2": border2,
        "--nav": dark
            ? hexAlpha(cfg.background_color, 0.88)
            : hexAlpha(cfg.background_color, 0.92),
        "--shadow": shadows.md,
        "--shadow2": shadows.lg,
    } as ThemeTokens;
}

export function buildThemeStyleTag(tokens: ThemeTokens, nonce?: string): string {
    const vars = Object.entries(tokens)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n");

    return `<style${nonce ? ` nonce="${nonce}"` : ""}>\n:root {\n${vars}\n}\n</style>`;
}