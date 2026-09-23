import {
    ChefHat,
    QrCode,
    ExternalLink,
    Palette,
    ArrowRight,
} from 'lucide-react';

function QuickAction({
    icon: Icon,
    label,
    desc,
    onClick,
}: {
    icon: any;
    label: string;
    desc: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="group flex items-center justify-between gap-3 w-full p-4 rounded-xl border text-left transition-all duration-200 hover:bg-theme3 hover:-translate-y-0.5"
            style={{
                borderColor: 'var(--border)',
                background: 'var(--card)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                    style={{
                        background: 'var(--accentlt)',
                        color: 'var(--accent)',
                    }}
                >
                    <Icon size={17} />
                </div>

                <div className="min-w-0">
                    <p className="text-sm font-semibold text-theme truncate">
                        {label}
                    </p>

                    <p className="text-xs text-theme2 mt-0.5 truncate">
                        {desc}
                    </p>
                </div>
            </div>

            <ArrowRight
                size={15}
                className="text-theme3 group-hover:text-[var(--accent)] transition-colors flex-shrink-0"
            />
        </button>
    );
}

export function QuickActions({
    onNavigate,
}: {
    onNavigate: (section: string) => void;
}) {
    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="text-sm font-semibold text-theme">
                        Quick Actions
                    </h3>

                    <p className="text-xs text-theme2 mt-0.5">
                        Common tasks to manage your restaurant.
                    </p>
                </div>

                <button
                    onClick={() => onNavigate('analytics')}
                    className="hidden sm:flex items-center gap-1 text-xs font-semibold"
                    style={{ color: 'var(--accent)' }}
                >
                    View Analytics
                    <ArrowRight size={14} />
                </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <QuickAction
                    icon={ChefHat}
                    label="Add Menu Item"
                    desc="Add a new dish to your menu"
                    onClick={() => onNavigate('menu')}
                />

                <QuickAction
                    icon={QrCode}
                    label="Generate QR Code"
                    desc="Create a new QR code"
                    onClick={() => onNavigate('qr-codes')}
                />

                <QuickAction
                    icon={ExternalLink}
                    label="Open Live Menu"
                    desc="View your menu as customers see it"
                    onClick={() => onNavigate('menu')}
                />

                <QuickAction
                    icon={Palette}
                    label="Customize Menu"
                    desc="Change theme, colors and layout"
                    onClick={() => onNavigate('customization')}
                />
            </div>
        </section>
    );
}