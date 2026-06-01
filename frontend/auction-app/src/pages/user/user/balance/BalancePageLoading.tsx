export default function BalancePageLoading() {
    const skeletonCards = [1, 2, 3];

    return (
        <div className="flex flex-col gap-8 w-full animate-fade-in">
            <div>
                <div className="h-6 w-44 bg-neutral-200 rounded-lg animate-pulse" />
                <div className="h-3.5 w-72 bg-neutral-100 rounded-md animate-pulse mt-2" />
            </div>

            <div className="w-full bg-neutral-100 border border-neutral-200 h-[124px] sm:h-[112px] rounded-2xl animate-pulse relative overflow-hidden" />

            <hr className="border-neutral-100" />

            <div className="space-y-5">
                <div className="space-y-2">
                    <div className="h-5 w-36 bg-neutral-200 rounded-md animate-pulse" />
                    <div className="h-3 w-64 bg-neutral-100 rounded-md animate-pulse" />
                </div>

                <div className="space-y-3">
                    {skeletonCards.map((index) => (
                        <div key={index} className="h-[68px] w-full border border-neutral-100 rounded-xl flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-neutral-100 rounded-full animate-pulse" />
                                <div className="space-y-2">
                                    <div className="h-3.5 w-24 bg-neutral-100 rounded animate-pulse" />
                                    <div className="h-2.5 w-16 bg-neutral-50 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-4 w-14 bg-neutral-100 rounded animate-pulse" />
                                <div className="h-6 w-16 bg-neutral-100 rounded-full animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}