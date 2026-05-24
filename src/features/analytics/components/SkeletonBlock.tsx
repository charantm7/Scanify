import SkeletonBlock from "../../../components/ui/SkeletonBlock";

export default function AnalyticsSkeletonBlock() {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <SkeletonBlock h="h-8" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
                <SkeletonBlock h="h-28" />
                <SkeletonBlock h="h-28" />
                <SkeletonBlock h="h-28" />
            </div>
            <SkeletonBlock h="h-48" />
            <SkeletonBlock h="h-64" />
        </div>
    );
}