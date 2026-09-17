'use client';

import QrPanel from '../../../features/qr/QrPanel';
import { useTabNavigate } from '../../../features/shell/navigation';

export default function Page() {
    const onNavigate = useTabNavigate();
    return <QrPanel onNavigate={onNavigate} />;
}
