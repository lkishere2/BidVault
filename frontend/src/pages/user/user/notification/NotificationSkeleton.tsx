interface NotificationSkeletonProps {
    count?: number;
}

function SkeletonRow() {
    return (
        <div className="flex items-start gap-4 px-5 py-4 rounded-xl border border-neutral-100 bg-white animate-pulse">
            {/* Icon placeholder */}
            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex-shrink-0" />

            {/* Text */}
            <div className="flex-1 flex flex-col gap-2 pt-0.5">
                <div className="h-3.5 bg-neutral-100 rounded w-[75%]" />
                <div className="h-3.5 bg-neutral-100 rounded w-[50%]" />
                <div className="h-3 bg-neutral-100 rounded w-[25%] mt-0.5" />
            </div>
        </div>
    );
}

export default function NotificationSkeleton({ count = 6 }: NotificationSkeletonProps) {
    return (
        <div className="flex flex-col gap-2">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonRow key={i} />
            ))}
        </div>
    );
}