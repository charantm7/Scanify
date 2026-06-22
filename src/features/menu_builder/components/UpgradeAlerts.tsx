'use client';

// src/features/menu/components/UpgradeAlerts.tsx
// Redesigned: more visually distinctive upgrade banners

import { Zap, AlertTriangle, Clock } from 'lucide-react';

interface UpgradeAlertsProps {
  isTrialExpired: boolean;
  isAtMenuLimit: boolean;
  isTrialing: boolean;
  maxMenuItems: number;
  onUpgrade: () => void;
}

function UpgradeBanner({
  type,
  icon: Icon,
  title,
  message,
  onUpgrade,
}: {
  type: 'warning' | 'info';
  icon: React.ElementType;
  title: string;
  message: string;
  onUpgrade: () => void;
}) {
  const colors = {
    warning: { bg: '#fffbeb', border: '#fde68a', icon: '#d97706', text: '#92400e' },
    info: { bg: '#eff6ff', border: '#bfdbfe', icon: '#2563eb', text: '#1e3a8a' },
  }[type];

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: colors.border }}
      >
        <Icon size={15} style={{ color: colors.icon }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: colors.text }}>
          {title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: colors.icon }}>
          {message}
        </p>
      </div>

      <button
        onClick={onUpgrade}
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition"
        style={{ background: colors.icon, color: '#fff' }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        <Zap size={11} /> Upgrade
      </button>
    </div>
  );
}

export function UpgradeAlerts({
  isTrialExpired,
  isAtMenuLimit,
  isTrialing,
  maxMenuItems,
  onUpgrade,
}: UpgradeAlertsProps) {
  return (
    <div className="space-y-2">
      {isTrialExpired && (
        <UpgradeBanner
          type="info"
          icon={Clock}
          title="Free trial ended"
          message="Upgrade now to keep managing your menu and unlock all Scanify features."
          onUpgrade={onUpgrade}
        />
      )}
      {isAtMenuLimit && (
        <UpgradeBanner
          type="warning"
          icon={AlertTriangle}
          title={`Item limit reached — ${maxMenuItems}/${maxMenuItems} on ${isTrialing ? 'Trial' : 'Free'} plan`}
          message="Upgrade to Starter or Pro to add unlimited menu items."
          onUpgrade={onUpgrade}
        />
      )}
    </div>
  );
}