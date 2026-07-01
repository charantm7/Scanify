export function SectionHeader({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) {
    return (
        <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'var(--accentlt)' }}>
                <Icon size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
                <h3 className="font-syne font-bold text-sm text-theme">{title}</h3>
                {description && <p className="text-xs text-theme2 mt-0.5">{description}</p>}
            </div>
        </div>
    );
}