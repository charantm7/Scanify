import { BarChart2 } from "lucide-react";

import Section from "./SectionWrapper";
import BarChart from "./charts/BarChart";
import { AnalyticsStats } from "../types";
import { AnalyticsPeriod } from "../constants";

export default function ScanTrenchChart({ stats, period }: { stats: AnalyticsStats, period: AnalyticsPeriod }) {
    return (
        <Section title="Scans over time" subtitle={`QR scan events — last ${period}`} icon={BarChart2}>
            {stats.scansByDay.every(d => d.value === 0) ? (
                <p className="text-sm text-center py-6" style={{ color: 'var(--muted-foreground)' }}>
                    No scan data for this period.
                </p>
            ) : (
                <BarChart
                    data={stats.scansByDay}
                    height={96}
                    showEveryNth={Math.ceil(stats.scansByDay.length / 10)}
                />
            )}
        </Section>
    )
}