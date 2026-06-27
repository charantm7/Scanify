// ─────────────────────────────────────────────────────────────────────────────
// HOW TO WIRE customization INTO THE CONSOLE
// ─────────────────────────────────────────────────────────────────────────────

// 1. COPY the `customization/` folder into:
//       src/features/customization/
//    The final path tree should look like:
//
//    src/features/customization/
//    ├── index.ts
//    ├── types/index.ts
//    ├── constants/index.ts
//    ├── queries/customization.queries.ts
//    ├── services/customization.service.ts
//    ├── hooks/useCustomization.ts
//    └── components/
//        ├── ColorField.tsx
//        ├── OptionPicker.tsx
//        ├── PresetGrid.tsx
//        ├── VisibilityToggle.tsx
//        ├── LivePreview.tsx
//        └── tabs/
//            ├── ThemeTab.tsx
//            ├── LayoutTab.tsx
//            ├── TypographyTab.tsx
//            └── VisibilityTab.tsx
//    └── pages/
//        └── CustomizationPanel.tsx


// 2. UPDATE src/components/console/Sidebar.tsx
//    Add 'customization' to NAV_ITEMS:
//
//    import { Palette } from 'lucide-react'; // add to imports
//
//    export const NAV_ITEMS = [
//      { id: 'dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
//      { id: 'menu',          label: 'Menu Builder',   icon: ChefHat },
//      { id: 'qr-codes',      label: 'QR Codes',       icon: QrCode },
//      { id: 'analytics',     label: 'Analytics',      icon: BarChart2 },
// +    { id: 'customization', label: 'Customization',  icon: Palette },
//      { id: 'billing',       label: 'Subscription',   icon: Receipt },
//      { id: 'settings',      label: 'Settings',       icon: Settings },
//    ];


// 3. UPDATE src/components/console/ConsoleShell.tsx
//    Add the import and the case to the Panel switch:
//
//    import { CustomizationPanel } from '../../features/customization';
//
//    function Panel({ id, onNavigate }) {
//      switch (id) {
//        case 'dashboard':      return <DashboardPanel onNavigate={onNavigate} />;
//        case 'menu':           return <MenuPanel onNavigate={onNavigate} />;
//        case 'qr-codes':       return <QRPanel onNavigate={onNavigate} />;
//        case 'analytics':      return <AnalyticsPanel onNavigate={onNavigate} />;
// +     case 'customization':  return <CustomizationPanel />;
//        case 'settings':       return <SettingsPanel />;
//        case 'billing':        return <BillingPanel />;
//        default: return (...);
//      }
//    }


// 4. VERIFY the import path in CustomizationPanel.tsx:
//    The component imports from '../../menu/constant' and '../../menu/types'.
//    If your menu feature lives at src/features/menu/, those relative paths
//    resolve correctly from src/features/customization/hooks/*.
//    The shared UI imports Card from '../../../components/shared/ui' —
//    same pattern the other panels use.

// 5. NO NEW DB MIGRATIONS NEEDED.
//    The feature uses the existing `menu_customizations` table with upsert
//    (onConflict: 'hotel_id'), so first save creates the row, subsequent
//    saves update it. The schema you provided already has all required columns.

// 6. PLAN-GATING.
//    Preset themes with a `plan` field show a lock icon for users below that plan.
//    The visibility tab gates `show_scanify_badge` (remove branding) behind
//    `canRemoveBranding` from AppContext, which already derives from plan_limits.
//    Colour/layout/typography controls are not gated — keeping the editor
//    feel generous without giving away paid features.
