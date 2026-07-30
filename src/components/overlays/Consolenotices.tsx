'use client';

import {
    Clock,
    AlertTriangle,
    XCircle,
    CreditCard,
    Zap,
    X,
    ChefHat,
    BarChart2, PanelTop, ScanBarcode,
    DollarSign,
    Funnel,
    FireExtinguisher
} from 'lucide-react';

import { UpgradeGate } from './UpgradeGate';
import { AnalyticsLevel } from '../../features/analytics/constants';
import { useApp } from '../../context/AppContext';


interface NoticeProps {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    bg: string;
    title: string;
    description: string;
    action?: React.ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
}

function NoticeCard({
    icon: Icon,
    iconBg,
    iconColor,
    borderColor,
    bg,
    title,
    description,
    action,
    dismissible,
    onDismiss,
}: NoticeProps) {
    return (
        <div
            className="flex items-start gap-4 rounded-2xl border px-5 py-4"
            style={{ background: bg, borderColor }}
        >

            <div
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                style={{ background: iconBg }}
            >
                <Icon size={17} style={{ color: iconColor }} />
            </div>

            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3">

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-theme leading-snug">{title}</p>
                    <p className="text-xs text-theme2 mt-0.5 leading-relaxed">{description}</p>
                </div>

                {action && (
                    <div className="flex-shrink-0">
                        {action}
                    </div>
                )}

            </div>


            {dismissible && onDismiss && (
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 text-theme2 hover:text-theme transition-colors mt-0.5"
                    aria-label="Dismiss"
                >
                    <X size={15} />
                </button>
            )}
        </div>
    );
}



function UpgradeButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold"
            style={{ background: 'var(--accent)' }}
        >
            <Zap size={12} /> Upgrade
        </button>
    );
}


export function TrialActiveNotice({ isTrialing, trialDaysLeft, trialHoursLeft, onUpgrade }: { isTrialing: boolean; trialDaysLeft: number; trialHoursLeft: number; onUpgrade: () => void }) {
    if (!isTrialing) return null;

    return (
        <NoticeCard
            icon={Clock}
            bg="var(--accentlt)"
            borderColor="var(--accent)"
            iconBg="var(--accent)"
            iconColor="white"
            title={`Free Trial · ${trialHoursLeft}h left`}
            description={`You have full Starter access for ${trialDaysLeft} more day${trialDaysLeft !== 1 ? 's' : ''}. After that, you'll drop to the free tier (5 items, 1 QR). Upgrade now to keep everything.`}
            action={<UpgradeButton onClick={onUpgrade} />}
        />
    );
}


export function TrialExpiredNotice({ isTrialExpired, onUpgrade }: { isTrialExpired: boolean; onUpgrade: () => void }) {
    if (!isTrialExpired) return null;

    return (
        <NoticeCard
            icon={AlertTriangle}
            bg="#fefce8"
            borderColor="#d9770633"
            iconBg="#fef9c3"
            iconColor="#d97706"
            title="Your free trial has ended"
            description="Your trial has ended. Upgrade to continue managing your menu and unlock all features."
            action={<UpgradeButton onClick={onUpgrade} />}
        />
    );
}


export function PaymentFailedNotice({ isPastDue, onUpgrade }: { isPastDue: boolean; onUpgrade: () => void }) {
    if (!isPastDue) return null;

    return (
        <NoticeCard
            icon={XCircle}
            bg="#fef2f2"
            borderColor="#dc262633"
            iconBg="#fee2e2"
            iconColor="#dc2626"
            title="Payment failed — action required"
            description="We couldn't charge your saved payment method. Update your billing details to restore full access."
            action={<UpgradeButton onClick={onUpgrade} />}
        />
    );
}



export function CancelledNotice({ isCancelled, onUpgrade }: { isCancelled: boolean; onUpgrade: () => void }) {
    if (!isCancelled) return null;

    return (
        <NoticeCard
            icon={CreditCard}
            bg="#fef2f2"
            borderColor="#dc262633"
            iconBg="#fee2e2"
            iconColor="#dc2626"
            title="Subscription cancelled"
            description="Your plan is active until the end of the current billing period. After that, you'll be moved to the free tier."
            action={<UpgradeButton onClick={onUpgrade} />}
        />
    );
}

export function PlanExpiredNotice({ isExpired, onUpgrade, planLabel }: { isExpired: boolean; onUpgrade: () => void; planLabel: string }) {
    if (!isExpired) return null;

    return (
        <NoticeCard
            icon={CreditCard}
            bg="#fef2f2"
            borderColor="#dc262633"
            iconBg="#fee2e2"
            iconColor="#dc2626"
            title="Subscription Expired"
            description={`Your '${planLabel}' plan has been expired, upgrade to renew your plan.`}
            action={<UpgradeButton onClick={onUpgrade} />}
        />
    );
}


export function MenuLimitNotice({ isAtMenuLimit, maxMenuItems, isSubscriptionOk, onUpgrade }: { isAtMenuLimit: boolean; maxMenuItems: number; isSubscriptionOk: boolean; onUpgrade: () => void }) {
    if (!isAtMenuLimit || !isSubscriptionOk) return null;

    return (
        <NoticeCard
            icon={ChefHat}
            bg="var(--accentlt)"
            borderColor="var(--accent)33"
            iconBg="var(--accent)"
            iconColor="white"
            title={`Menu item limit reached (${maxMenuItems} items)`}
            description="You've hit your plan's menu item cap. Upgrade to add unlimited items."
            action={<UpgradeButton onClick={onUpgrade} />}
        />
    );
}




interface AnalyticsLockedNoticeProps {
    level: AnalyticsLevel;
    onNavigate?: (page: string) => void;
}


export function AnalyticsLockedNotice({ level, onNavigate }: AnalyticsLockedNoticeProps) {
    const { canViewBasicAnalytics, canViewAdvancedAnalytics } = useApp();

    const locked = level === 'basic' ? !canViewBasicAnalytics : !canViewAdvancedAnalytics;

    if (!locked) return null;

    const config = {
        basic: {
            title: "Analytics not available on your plan",
            description:
                "Upgrade to Growth or higher to see scan stats, item views, and customer trends.",
            features: [{ icon: BarChart2, label: 'Stats' }, { icon: PanelTop, label: 'Top Items' }, { icon: ScanBarcode, label: 'Total Scans', }, { icon: ChefHat, label: 'Menu Views', }]
        },

        advance: {
            title: "Advanced analytics locked",
            description:
                "Upgrade to Pro to unlock funnels, heatmaps, peak hours, and advanced customer insights.",
            features: [{ icon: Funnel, label: 'Funnel Analysis' }, { icon: FireExtinguisher, label: 'Peak Hour HeatMap' }, { icon: DollarSign, label: 'Order Revenue', }, { icon: ScanBarcode, label: 'Qr Performance', }]
        },
    };

    return (
        <>
            <UpgradeGate
                title={config[level].title}
                description={config[level].description}
                features={config[level].features}
                onUpgrade={() => onNavigate?.('billing')}
            />

        </>
    );
}


export function FeatureGateNotice({
    feature,
    description,
    requiredPlan,
    onUpgrade
}: {
    feature: string;
    description: string;
    requiredPlan: string;
    onUpgrade: () => void;
}) {
    return (
        <NoticeCard
            icon={Zap}
            bg="var(--accentlt)"
            borderColor="var(--accent)33"
            iconBg="var(--accent)"
            iconColor="white"
            title={`${feature} — ${requiredPlan} plan required`}
            description={description}
            action={<UpgradeButton onClick={onUpgrade} />}
        />
    );
}


export function ConsoleNotices({
    isTrialExpired,
    isPastDue,
    isCancelled,
    isTrialing,
    trialDaysLeft,
    trialHoursLeft,
    isExpired,
    planLabel,
    onUpgrade }:
    {
        isTrialExpired: boolean;
        isPastDue: boolean;
        isCancelled: boolean;
        isTrialing: boolean;
        trialDaysLeft: number;
        trialHoursLeft: number;
        isExpired: boolean;
        planLabel: string;
        onUpgrade: () => void
    }) {

    if (isExpired) return <PlanExpiredNotice isExpired={isExpired} onUpgrade={onUpgrade} planLabel={planLabel} />
    if (isTrialExpired) return <TrialExpiredNotice isTrialExpired={isTrialExpired} onUpgrade={onUpgrade} />;
    if (isPastDue) return <PaymentFailedNotice isPastDue={isPastDue} onUpgrade={onUpgrade} />;
    if (isCancelled) return <CancelledNotice isCancelled={isCancelled} onUpgrade={onUpgrade} />;
    if (isTrialing) return <TrialActiveNotice isTrialing={isTrialing} trialDaysLeft={trialDaysLeft} trialHoursLeft={trialHoursLeft} onUpgrade={onUpgrade} />;

    return null;
}