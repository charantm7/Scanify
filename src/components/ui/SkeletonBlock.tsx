export default function SkeletonBlock({ h = 'h-40' }: { h?: string }) {
    return (
        <div
            className={`${h} rounded-2xl animate-pulse`}
            style={{ background: 'var(--border)' }}
        />
    );
}