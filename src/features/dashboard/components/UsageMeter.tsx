import { Card } from "../../../components/shared/ui";

export function UsageMeter({
    menuItemCount, maxMenuItems, planLabel,
}: { menuItemCount: number; maxMenuItems: number; planLabel: string }) {
    if (maxMenuItems === -1) return null; // unlimited plan — nothing to meter

    const pct = Math.min((menuItemCount / maxMenuItems) * 100, 100);
    const atLimit = menuItemCount >= maxMenuItems;

    return (
        <Card>
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-theme">Menu Item Usage</p>
                <span className="text-xs font-bold" style={{ color: atLimit ? '#dc2626' : 'var(--accent)' }}>
                    {menuItemCount} / {maxMenuItems}
                </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: atLimit ? '#dc2626' : 'var(--accent)' }}
                />
            </div>
            <p className="text-xs text-theme2 mt-1.5">
                {maxMenuItems - menuItemCount > 0
                    ? `${maxMenuItems - menuItemCount} slots remaining on ${planLabel} plan`
                    : 'Limit reached — upgrade to add more items'}
            </p>
        </Card>
    );
}