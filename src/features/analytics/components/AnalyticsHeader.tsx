import { RefreshCw } from "lucide-react";

import { AnalyticsLevel, AnalyticsPeriod } from "../constants";
import LevelSelector from "./selectors/LevelSelector";
import PeriodSelector from "./selectors/PeriodSelector";

export default function PageHeader({
    period,
    onPeriodChange,
    onRefetch,
    level,
    onLevelChange

}: {
    period: AnalyticsPeriod;
    onPeriodChange: (p: AnalyticsPeriod) => void;
    onRefetch: () => void;
    level: AnalyticsLevel;
    onLevelChange: (p: AnalyticsLevel) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
                <h1
                    className="font-bold text-2xl"
                    style={{ color: 'var(--foreground)', fontFamily: 'var(--font-syne, sans-serif)' }}
                >
                    Analytics
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    How your menu performs
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
                <LevelSelector value={level} onChange={onLevelChange} />

                <div className='flex gap-2'>
                    <PeriodSelector value={period} onChange={onPeriodChange} />
                    <button
                        onClick={onRefetch}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:opacity-80"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                        title="Refresh"
                    >
                        <RefreshCw size={14} style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                </div>

            </div >
        </div >
    );
}