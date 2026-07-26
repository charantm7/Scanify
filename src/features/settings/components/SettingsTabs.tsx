import { SETTINGS_TABS } from '../constants';
import type { SettingsTabId } from '../types';

export function SettingsTabs({ active, onChange }: { active: SettingsTabId; onChange: (id: SettingsTabId) => void }) {
    return (
        <div
            className="flex w-full gap-1 overflow-x-auto rounded-md p-1"
            style={{ background: "var(--border)" }}
        >
            {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onChange(id)}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${active === id
                        ? "text-white shadow"
                        : "text-theme2 hover:text-theme"
                        }`}
                    style={active === id ? { background: "var(--accent)" } : {}}
                >
                    <Icon size={14} />
                    {label}
                </button>
            ))}
        </div>
    );
}