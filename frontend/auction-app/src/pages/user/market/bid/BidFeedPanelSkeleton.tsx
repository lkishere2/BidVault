import FeedItemSkeleton from './FeedItemSkeleton';

export default function BidFeedPanelSkeleton() {
    return (
        <div className="flex flex-col h-full bg-neutral-50/50 border-l border-neutral-100 animate-pulse">
            <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-100 bg-white">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-neutral-200" />
                    <div className="h-4 w-20 bg-neutral-200 rounded" />
                </div>
                <div className="h-5 w-16 bg-neutral-100 rounded-full" />
            </div>

            <div className="flex-1 p-5 overflow-hidden">
                <div className="flex flex-col gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <FeedItemSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
