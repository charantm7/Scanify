import { ChefHat, QrCode, BarChart2, Clock } from 'lucide-react';
import { StatCard } from '../../../components/shared/ui';

export function StatsGrid({
    menuItemCount, maxMenuItems, qrCount, scanCount, accountAge, loading,
}: {
    menuItemCount: number; maxMenuItems: number; qrCount: number; scanCount: number; accountAge: string; loading?: boolean;
}) {
    return (
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 transition-opacity ${loading ? 'opacity-50' : ''}`}>
            <StatCard icon={ChefHat} label="Menu Items" value={menuItemCount} sub={`${menuItemCount} / ${maxMenuItems === -1 ? '∞' : maxMenuItems}`} />
            <StatCard icon={QrCode} label="QR Codes" value={qrCount} sub="Generated" />
            <StatCard icon={BarChart2} label="Total Scans" value={scanCount} sub="All time" />
            <StatCard icon={Clock} label="Account Age" value={accountAge} sub="Since joining" />
        </div>
    );
}