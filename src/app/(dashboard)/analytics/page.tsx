'use client';

import AnalyticsPanel from '../../../features/analytics/components/AnalyticsPanel';
import { useTabNavigate } from '../../../features/shell/navigation';

export default function Page() {
    const onNavigate = useTabNavigate();
    return <AnalyticsPanel onNavigate={onNavigate} />;
}
