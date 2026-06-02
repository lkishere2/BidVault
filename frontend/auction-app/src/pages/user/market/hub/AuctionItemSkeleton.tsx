export default function AuctionItemSkeleton() {
    return (
        <div className="w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-neutral-100" />
            <div className="p-4">
                <div className="h-3 w-1/3 bg-neutral-100 rounded-full mb-2" />
                <div className="h-4 w-4/5 bg-neutral-100 rounded-full mb-1.5" />
                <div className="h-4 w-3/5 bg-neutral-100 rounded-full mb-3" />
                <div className="flex gap-1.5 mb-3">
                    <div className="h-4 w-12 bg-neutral-100 rounded-full" />
                    <div className="h-4 w-16 bg-neutral-100 rounded-full" />
                </div>
                <div className="border-t border-neutral-100 pt-3 flex items-end justify-between">
                    <div>
                        <div className="h-2.5 w-16 bg-neutral-100 rounded-full mb-1.5" />
                        <div className="h-6 w-24 bg-neutral-100 rounded-full" />
                    </div>
                    <div className="text-right">
                        <div className="h-2.5 w-14 bg-neutral-100 rounded-full mb-1.5 ml-auto" />
                        <div className="h-2.5 w-18 bg-neutral-100 rounded-full ml-auto" />
                    </div>
                </div>
            </div>
        </div>
    );
}