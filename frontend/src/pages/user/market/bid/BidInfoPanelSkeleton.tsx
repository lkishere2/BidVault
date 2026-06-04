export default function BidInfoPanelSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white p-5 animate-pulse">
            <div className="flex gap-4 mb-5">
                <div className="w-20 h-20 rounded-xl bg-neutral-100 flex-shrink-0" />
                <div className="min-w-0 flex-1 py-1">
                    <div className="h-3 w-16 bg-neutral-100 rounded mb-2" />
                    <div className="h-4 w-3/4 bg-neutral-100 rounded mb-3" />
                    <div className="h-5 w-12 bg-neutral-100 rounded-full" />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-neutral-50 rounded-xl p-3 flex flex-col items-center">
                        <div className="h-2 w-12 bg-neutral-200 rounded mb-2" />
                        <div className="h-4 w-16 bg-neutral-200 rounded" />
                    </div>
                ))}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 mb-5">
                <div className="h-3 w-3 bg-neutral-100 rounded-full" />
                <div className="h-3 w-24 bg-neutral-100 rounded" />
            </div>

            <div className="w-full h-[48px] rounded-xl bg-neutral-100" />
        </div>
    );
}
