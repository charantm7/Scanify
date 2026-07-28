import { Zap } from 'lucide-react';
import { Alert } from '../../../components/shared/ui';

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

export function TrialStatusAlert({
    isTrialing, isTrialExpired, trialHoursLeft, trialDaysLeft, onUpgrade,
}: {
    isTrialing: boolean;
    isTrialExpired: boolean;
    trialHoursLeft: number;
    trialDaysLeft: number;
    onUpgrade: () => void;
}) {
    if (isTrialExpired) {
        return (
            <Alert
                type="info"
                title="Free Trial Ended"
                message="Your trial has ended. Upgrade to continue managing your menu and unlock all features."
                action={<UpgradeButton onClick={onUpgrade} />}
            />
        );
    }

    if (isTrialing) {
        return (
            <Alert
                type="info"
                title={`Free Trial · ${trialHoursLeft}h left`}
                message={`You have full Starter access for ${trialDaysLeft} more day${trialDaysLeft !== 1 ? 's' : ''}. After that, you'll drop to the free tier (5 items, 1 QR). Upgrade now to keep everything.`}
                action={<UpgradeButton onClick={onUpgrade} />}
            />
        );
    }

    return null;
}