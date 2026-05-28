import SkeletonBlock from "../../../components/ui/SkeletonBlock";

export default function AnalyticsSkeletonBlock() {
    return (
        <div className="space-y-5">


            <div className="flex items-center justify-between">
                <SkeletonBlock
                    h="h-8"
                    w="w-40"
                />

                <SkeletonBlock
                    h="h-8"
                    w="w-24"
                />
            </div>


            <div className="grid gap-4 sm:grid-cols-3">
                <SkeletonBlock h="h-28" />
                <SkeletonBlock h="h-28" />
                <SkeletonBlock h="h-64" />
            </div>



            <SkeletonBlock h="h-64" />
        </div>
    );
}