'use client';

import CustomizationPanel from '../../../features/customization/components/CustomizationPanel';
import { useTabNavigate } from '../../../features/shell/navigation';

export default function Page() {
    const onNavigate = useTabNavigate();
    return <CustomizationPanel onNavigate={onNavigate} />;
}
