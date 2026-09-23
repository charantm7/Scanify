'use client';

import DashboardPanel from '../../../features/dashboard/DashboardPanel';
import { useTabNavigate } from '../../../features/shell/navigation';

export default function Page() {
    const onNavigate = useTabNavigate();
    return <DashboardPanel onNavigate={onNavigate} />;
}
