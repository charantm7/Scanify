'use client';

import MenuPanel from '../../../features/menu_builder/components/MenuPanel';
import { useTabNavigate } from '../../../features/shell/navigation';

export default function Page() {
    const onNavigate = useTabNavigate();
    return <MenuPanel onNavigate={onNavigate} />;
}
