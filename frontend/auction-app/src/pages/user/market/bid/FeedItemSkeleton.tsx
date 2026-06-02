export default function FeedItemSkeleton() {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 bg-white mb-2 animate-pulse">
            <div className="flex flex-col gap-1.5">
                <div className="h-4 w-24 bg-neutral-100 rounded" />
                <div className="flex items-center gap-1">
                    <div className="h-3 w-3 bg-neutral-100 rounded-full" />
                    <div className="h-3 w-16 bg-neutral-100 rounded" />
                </div>
            </div>
            <div className="h-5 w-20 bg-neutral-100 rounded" />
        </div>
    );
}
