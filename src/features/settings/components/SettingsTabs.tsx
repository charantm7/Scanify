import { SETTINGS_TABS } from '../constants';
import type { SettingsTabId } from '../types';

export function SettingsTabs({ active, onChange }: { active: SettingsTabId; onChange: (id: SettingsTabId) => void }) {
    return (
        <div className="flex gap-1 p-1 rounded-xl w-fit overflow-x-auto" style={{ background: 'var(--border)' }}>
            {SETTINGS_TABS.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onChange(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${active === id ? 'text-white shadow' : 'text-theme2 hover:text-theme'}`}
                    style={active === id ? { background: 'var(--accent)' } : {}}
                >
                    <Icon size={14} /> {label}
                </button>
            ))}
        </div>
    );
}