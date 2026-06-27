// features/customization/index.ts
// Public API for the customization feature.

export { default as CustomizationPanel } from './pages/CustomizationPanel';
export { useCustomization } from './hooks/useCustomization';
export type { CustomizationDraft, PresetTheme, CustomizationTab, SaveStatus } from './types';
