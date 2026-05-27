'use client';

import {
    Clock,
    AlertTriangle,
    XCircle,
    CreditCard,
    Zap,
    X,
    ArrowRight,
    ChefHat,
    BarChart2, PanelTop, ScanBarcode,
    DollarSign,
    Funnel,
    FireExtinguisher
} from 'lucide-react';

import { UpgradeGate } from './UpgradeGate';
import { usePlan } from '../../hooks/usePlan';
import Link from 'next/link';
import { AnalyticsLevel } from '../../features/analytics/constants';


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


            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-theme leading-snug">{title}</p>
                <p className="text-xs text-theme2 mt-0.5 leading-relaxed">{description}</p>
                {action && <div className="mt-3">{action}</div>}
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


function NoticeCTA({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: 'var(--accent)' }}
        >
            {label}
            <ArrowRight size={12} />
        </Link>
    );
}


export function TrialActiveNotice() {
    const { isTrialing, trialDaysLeft, trialHoursLeft } = usePlan();
    if (!isTrialing) return null;

    const timeLabel = trialDaysLeft > 1
        ? `${trialDaysLeft} days`
        : trialHoursLeft > 0
            ? `${trialHoursLeft} hour${trialHoursLeft !== 1 ? 's' : ''}`
            : 'less than an hour';

    return (
        <NoticeCard
            icon={Clock}
            bg="var(--accentlt)"
            borderColor="var(--accent)33"
            iconBg="var(--accent)"
            iconColor="white"
            title={`Free trial — ${timeLabel} remaining`}
            description="You have full access to all features during your trial. Upgrade before it ends to keep everything."
            action={<NoticeCTA href="/billing" label="View plans" />}
        />
    );
}


export function TrialExpiredNotice() {
    const { isTrialExpired } = usePlan();
    if (!isTrialExpired) return null;

    return (
        <NoticeCard
            icon={AlertTriangle}
            bg="#fefce8"
            borderColor="#d9770633"
            iconBg="#fef9c3"
            iconColor="#d97706"
            title="Your free trial has ended"
            description="Your menu is still visible to customers, but you can no longer add or edit items. Choose a plan to continue."
            action={<NoticeCTA href="/billing" label="Choose a plan" />}
        />
    );
}


export function PaymentFailedNotice() {
    const { isPastDue } = usePlan();
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
            action={<NoticeCTA href="/billing" label="Update billing" />}
        />
    );
}



export function CancelledNotice() {
    const { isCancelled } = usePlan();
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
            action={<NoticeCTA href="/billing" label="Reactivate" />}
            dismissible
            onDismiss={() => { }} // parent can lift state if needed
        />
    );
}


export function MenuLimitNotice() {
    const { isAtMenuLimit, maxMenuItems, isSubscriptionOk } = usePlan();
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
            action={<NoticeCTA href="/billing" label="Upgrade plan" />}
        />
    );
}




interface AnalyticsLockedNoticeProps {
    level: AnalyticsLevel;
    onNavigate?: (page: string) => void;
}


export function AnalyticsLockedNotice({ level, onNavigate }: AnalyticsLockedNoticeProps) {
    const { canViewBasicAnalytics, canViewAdvancedAnalytics } = usePlan();

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
}: {
    feature: string;
    description: string;
    requiredPlan: string;
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
            action={<NoticeCTA href="/billing" label={`Upgrade to ${requiredPlan}`} />}
        />
    );
}


export function ConsoleNotices() {
    const { isTrialExpired, isPastDue, isCancelled, isTrialing } = usePlan();

    if (isTrialExpired) return <TrialExpiredNotice />;
    if (isPastDue) return <PaymentFailedNotice />;
    if (isCancelled) return <CancelledNotice />;
    if (isTrialing) return <TrialActiveNotice />;

    return null;
}