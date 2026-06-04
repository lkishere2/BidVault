export default function TransactionPageLoading() {
    const skeletonRows = [1, 2, 3, 4];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <div className="h-6 w-48 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3.5 w-80 bg-neutral-100 rounded-md animate-pulse mt-2" />
            </div>

            <div className="space-y-3">
                {skeletonRows.map((index) => (
                    <div key={index} className="border border-neutral-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-neutral-100 rounded-full animate-pulse" />
                            </div>
                            <div className="h-3.5 w-40 bg-neutral-100 rounded animate-pulse" />
                            <div className="h-3 w-32 bg-neutral-50 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0 w-full sm:w-auto">
                            <div className="h-9 flex-1 sm:flex-none sm:w-24 bg-neutral-100 rounded-lg animate-pulse" />
                            <div className="h-9 flex-1 sm:flex-none sm:w-24 bg-neutral-100 rounded-lg animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}