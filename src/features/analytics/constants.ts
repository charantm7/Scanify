export type AnalyticsPeriod = '7d' | '30d' | '90d';

export type AnalyticsLevel = 'basic' | 'advance';

export type AdvanceAnalytics = 'funnel' | 'peakhour' | 'busiestday' | 'qrperformance' | 'orderanalytics' | 'periodcomparison'

export const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: '#f59e0b' },
    accepted: { label: 'Accepted', color: '#3b82f6' },
    preparing: { label: 'Preparing', color: '#8b5cf6' },
    ready: { label: 'Ready', color: '#06b6d4' },
    served: { label: 'Served', color: '#22c55e' },
    cancelled: { label: 'Cancelled', color: '#ef4444' },
};

export const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
];

export const LEVELS: { value: AnalyticsLevel; label: string }[] = [
    { value: 'basic', label: 'Basic' },
    { value: 'advance', label: 'Advance' }
]

export const AnaltyicsType: { value: AdvanceAnalytics; label: string }[] = [
    { value: 'funnel', label: 'Engagement Funnel' },
    { value: 'peakhour', label: 'Peak Hours' },
    { value: 'busiestday', label: 'Busiest Day' },
    { value: 'orderanalytics', label: 'Order Analytics' },
    { value: 'periodcomparison', label: 'Period Comparison' },
    { value: 'qrperformance', label: 'Qr Code Performance' }

]