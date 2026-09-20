'use client';

import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useDashboardStats } from './hooks/useDashboardStats';
import { formatAccountAge } from './lib/formatAccountAge';
import { WelcomeBanner } from './components/WelcomeBanner';
import { HotelDetailsCard } from './components/HotelDetailsCard';
import { StatsGrid } from './components/StatsGrid';
import { QuickActions } from './components/QuickActions';
import { ConsoleNotices } from '../../components/overlays/Consolenotices';

export default function DashboardPanel({
    onNavigate,
}: {
    onNavigate: (section: string) => void;
}) {
    const {
        profile,
        hotel,
        menuItemCount,
        planLabel,
        isTrialing,
        isTrialExpired,
        trialHoursLeft,
        trialDaysLeft,
        isPastDue,
        isCancelled,
        isExpired,
    } = useApp();

    const { stats, loading: statsLoading } = useDashboardStats(hotel?.id);

    const appDomain =
        process.env.NEXT_PUBLIC_APP_DOMAIN || 'scanify.co.in';

    const menuUrl = hotel?.slug
        ? `${appDomain}/menu/${hotel.slug}`
        : null;

    const accountAge = formatAccountAge(profile?.created_at);

    const overviewItems = useMemo(
        () => [
            {
                label: 'Create your restaurant profile',
                done: !!hotel,
                onClick: hotel
                    ? undefined
                    : () => onNavigate('settings'),
            },
            {
                label: 'Add your first menu item',
                done: menuItemCount > 0,
                onClick: () => onNavigate('menu'),
            },
            {
                label: 'Generate a QR code',
                done: stats.qrCount > 0,
                onClick: () => onNavigate('qr-codes'),
            },
        ],
        [hotel, menuItemCount, stats.qrCount, onNavigate]
    );

    const setupComplete = overviewItems.every((item) => item.done);

    return (
        <div className="space-y-6">
            <ConsoleNotices
                isTrialExpired={isTrialExpired}
                isPastDue={isPastDue}
                isCancelled={isCancelled}
                isTrialing={isTrialing}
                trialDaysLeft={trialDaysLeft}
                trialHoursLeft={trialHoursLeft}
                onUpgrade={() => onNavigate('billing')}
                isExpired={isExpired}
                planLabel={planLabel}
            />

            <WelcomeBanner
                name={profile?.name}
                hotelName={hotel?.name}
            />

            {hotel && (
                <HotelDetailsCard
                    hotel={hotel}
                    menuUrl={menuUrl}
                    isTrialExpired={isTrialExpired}
                    navigate={onNavigate}
                />
            )}

            <StatsGrid
                menuItemCount={menuItemCount}
                qrCount={stats.qrCount}
                scanCount={stats.scanCount}
                accountAge={accountAge}
                loading={statsLoading}
            />

            <QuickActions onNavigate={onNavigate} />

            {!setupComplete && (
                <div
                    className="rounded-xl border px-4 py-3.5 flex items-center justify-between gap-4"
                    style={{
                        background: 'var(--accentlt)',
                        borderColor: 'var(--border)',
                    }}
                >
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-theme">
                            Finish setting up your restaurant
                        </p>
                        <p className="text-xs text-theme2 mt-0.5 truncate">
                            Complete the remaining steps to get your menu ready.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            const next = overviewItems.find(
                                (item) => !item.done
                            );

                            next?.onClick?.();
                        }}
                        className="flex-shrink-0 text-xs font-semibold"
                        style={{ color: 'var(--accent)' }}
                    >
                        Continue →
                    </button>
                </div>
            )}

            <div
                className="rounded-xl border px-4 py-3.5 flex items-center justify-between gap-4"
                style={{
                    background: 'var(--card)',
                    borderColor: 'var(--border)',
                }}
            >
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-theme">
                        Looking for detailed insights?
                    </p>
                    <p className="text-xs text-theme2 mt-0.5 truncate">
                        View scan trends, popular items and customer activity in Analytics.
                    </p>
                </div>

                <button
                    onClick={() => onNavigate('analytics')}
                    className="flex-shrink-0 text-xs font-semibold"
                    style={{ color: 'var(--accent)' }}
                >
                    View Analytics →
                </button>
            </div>
        </div>
    );
}