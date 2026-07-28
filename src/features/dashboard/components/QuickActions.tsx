import { ChefHat, QrCode, BarChart2, Building2, ArrowRight } from 'lucide-react';

function QuickAction({ icon: Icon, label, desc, onClick }: { icon: any; label: string; desc: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-between gap-3 bg-card border rounded-2xl p-4 w-full text-left cursor-pointer hover:border-[var(--accent)] transition-all group"
            style={{ borderColor: 'var(--border)' }}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--accentlt)' }}>
                    <Icon size={16} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-theme truncate">{label}</p>
                    <p className="text-xs text-theme2 truncate">{desc}</p>
                </div>
            </div>
            <ArrowRight size={15} className="text-theme2 group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
        </button>
    );
}

export function QuickActions({ onNavigate }: { onNavigate: (section: string) => void }) {
    return (
        <div>
            <h3 className="text-sm font-bold text-theme mb-3">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-3">
                <QuickAction icon={ChefHat} label="Manage Menu" desc="Add items, categories & prices" onClick={() => onNavigate('menu')} />
                <QuickAction icon={QrCode} label="Generate QR Code" desc="Create scannable QR for your menu" onClick={() => onNavigate('qr-codes')} />
                <QuickAction icon={BarChart2} label="View Analytics" desc="See scan trends and popular items" onClick={() => onNavigate('analytics')} />
                <QuickAction icon={Building2} label="Restaurant Settings" desc="Edit hotel profile and branding" onClick={() => onNavigate('settings')} />
            </div>
        </div>
    );
}