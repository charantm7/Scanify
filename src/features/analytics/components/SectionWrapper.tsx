export default function Section({
    title,
    subtitle,
    icon: Icon,
    children,
    action,
}: {
    title: string;
    subtitle?: string;
    icon?: React.ElementType;
    children: React.ReactNode;
    action?: React.ReactNode;
}) {
    return (
        <div
            className="rounded-2xl p-5 space-y-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    {Icon && (
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--accentlt)' }}
                        >
                            <Icon size={15} style={{ color: 'var(--accent)' }} />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
                            {title}
                        </p>
                        {subtitle && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}