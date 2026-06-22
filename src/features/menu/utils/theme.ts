
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
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
}

export function buildThemeTokens(c: Partial<DBMenuCustomization>): ThemeTokens {
    const cfg = { ...DEFAULT_CUSTOMIZATION, ...c } as DBMenuCustomization;
    const shadows = SHADOW_MAP[cfg.shadow_intensity];
    const dark = isDark(cfg.background_color);

    return {
        "--color-primary": cfg.primary_color,
        "--color-bg": cfg.background_color,
        "--color-surface": cfg.surface_color,
        "--color-text": cfg.text_color,
        "--color-accent": cfg.accent_color,
        "--color-muted": cfg.muted_color,
        "--color-accent-lt": hexAlpha(cfg.accent_color, dark ? 0.18 : 0.10),
        "--color-border": dark
            ? hexAlpha("#FFFFFF", 0.10)
            : hexAlpha("#000000", 0.08),
        "--color-border2": dark
            ? hexAlpha("#FFFFFF", 0.16)
            : hexAlpha("#000000", 0.12),
        "--border-radius": `${cfg.border_radius}px`,
        "--font-family": FONT_STACKS[cfg.font_family],
        "--shadow-sm": shadows.sm,
        "--shadow-md": shadows.md,
        "--shadow-lg": shadows.lg,
    };
}

export function buildThemeStyleTag(tokens: ThemeTokens, nonce?: string): string {
    const vars = Object.entries(tokens)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n");

    return `<style${nonce ? ` nonce="${nonce}"` : ""}>
            :root {
            ${vars}
            }
            </style>`;
}