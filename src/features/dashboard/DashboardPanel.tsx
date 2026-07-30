'use client';

import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useDashboardStats } from './hooks/useDashboardStats';
import { formatAccountAge } from './lib/formatAccountAge';
import { WelcomeBanner } from './components/WelcomeBanner';
import { HotelDetailsCard } from './components/HotelDetailsCard';
import { SetupChecklist } from './components/SetupChecklist';
import { StatsGrid } from './components/StatsGrid';
import { UsageMeter } from './components/UsageMeter';
import { QuickActions } from './components/QuickActions';
import { ConsoleNotices } from '../../components/overlays/Consolenotices';

export default function DashboardPanel({ onNavigate }: { onNavigate: (section: string) => void }) {
    const {
        profile, hotel,
        menuItemCount, plan, maxMenuItems, isTrialing, planLabel,
        isTrialExpired, trialHoursLeft, trialDaysLeft, isPastDue,
        isCancelled, isExpired
    } = useApp();

    const { stats, loading: statsLoading } = useDashboardStats(hotel?.id);

    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'scanify.co.in';
    const menuUrl = hotel?.slug ? `${appDomain}/menu/${hotel.slug}` : null;
    const accountAge = formatAccountAge(profile?.created_at);

    const checklistItems = useMemo(() => [
        { label: 'Create your restaurant profile', done: !!hotel, onClick: hotel ? undefined : () => onNavigate('settings') },
        { label: 'Add your first menu item', done: menuItemCount > 0, onClick: () => onNavigate('menu') },
        { label: 'Generate a QR code', done: stats.qrCount > 0, onClick: () => onNavigate('qr-codes') },
        { label: 'Get your first scan', done: stats.scanCount > 0, onClick: () => onNavigate('qr-codes') },
    ], [hotel, menuItemCount, stats.qrCount, stats.scanCount, onNavigate]);

    return (
        <div className="space-y-5 sm:space-y-6">

            <ConsoleNotices isTrialExpired={isTrialExpired} isPastDue={isPastDue} isCancelled={isCancelled} isTrialing={isTrialing} trialDaysLeft={trialDaysLeft} trialHoursLeft={trialHoursLeft} onUpgrade={() => onNavigate('billing')} isExpired={isExpired} planLabel={planLabel} />


            <WelcomeBanner name={profile?.name} hotelName={hotel?.name} planLabel={planLabel} />

            {hotel && (
                <HotelDetailsCard hotel={hotel} menuUrl={menuUrl} isTrialExpired={isTrialExpired} />
            )}

            <SetupChecklist items={checklistItems} />

            <StatsGrid
                menuItemCount={menuItemCount}
                maxMenuItems={maxMenuItems}
                qrCount={stats.qrCount}
                scanCount={stats.scanCount}
                accountAge={accountAge}
                loading={statsLoading}
            />

            {isTrialing && (
                <UsageMeter menuItemCount={menuItemCount} maxMenuItems={maxMenuItems} planLabel={plan === 'trial' ? 'trial' : 'Free'} />
            )}

            <QuickActions onNavigate={onNavigate} />
        </div>
    );
}