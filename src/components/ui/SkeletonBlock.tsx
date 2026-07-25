interface SkeletonBlockProps {
    h?: string;
    w?: string;
    className?: string;
}

export default function SkeletonBlock({
    h = "h-40",
    w = "w-full",
    className = "",
}: SkeletonBlockProps) {
    return (
        <div
            className={`
        ${h}
        ${w}
        rounded-2xl
        animate-pulse
        ${className}
      `}
            style={{
                background: "var(--border)",
            }}
        />
    );
}