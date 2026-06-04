import type { AuctionResponse } from '../../../../types/auction';

interface AuctionItemProps {
    auction: AuctionResponse;
    onClick: (auction: AuctionResponse) => void;
}

export default function AuctionItem({ auction, onClick }: AuctionItemProps) {
    const { productName, productImageUrl, currentPrice, startingPrice, productTags, status } = auction;
    const parsedCurrent = parseFloat(currentPrice?.toString() || '0');
    const parsedStart = parseFloat(startingPrice?.toString() || '0');
    const finalPrice = parsedCurrent > 0 && !isNaN(parsedCurrent) ? parsedCurrent : (!isNaN(parsedStart) ? parsedStart : 0);

    return (
        <div
            onClick={() => onClick(auction)}
            className="w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
            <div>
                <div className="aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                    <img
                        src={productImageUrl || "/placeholder-auction.jpg"}
                        alt={productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.currentTarget.onerror = null; // Prevent infinite loops
                            e.currentTarget.src = "/placeholder-auction.jpg";
                        }}
                    />
                    {status === 'ACTIVE' && (
                        <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Live Now
                        </span>
                    )}
                    {status === 'UPCOMING' && (
                        <span className="absolute top-3 left-3 bg-[#F5C518] text-[#0D0D0D] text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-md shadow-sm">
                            Upcoming
                        </span>
                    )}
                </div>

                <div className="p-4 pb-1">
                    <div className="flex flex-wrap gap-1 mb-2">
                        {productTags && productTags.length > 0 ? (
                            productTags.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="text-[11px] font-bold text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-100">
                                    {typeof tag === 'string' ? tag : (tag as any).name || 'Item'}
                                </span>
                            ))
                        ) : (
                            <span className="text-[11px] font-bold text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-md border border-neutral-100">
                                Marketplace
                            </span>
                        )}
                    </div>

                    <h3 className="text-[15px] font-bold text-[#0D0D0D] line-clamp-2 leading-snug tracking-tight group-hover:text-[#F5C518] transition-colors">
                        {productName}
                    </h3>
                </div>
            </div>

            <div className="p-4 pt-2">
                <div className="border-t border-neutral-100 pt-3 flex flex-col gap-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                            {parsedCurrent > 0 ? 'Current Bid' : 'Starting Price'}
                        </p>
                        <p className="text-[18px] font-black text-[#0D0D0D]">
                            ${finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="w-full">
                        <span className="block text-center w-full py-2 bg-[#0D0D0D] text-white text-[13px] font-bold rounded-xl group-hover:bg-[#F5C518] group-hover:text-[#0D0D0D] transition-colors">
                            Bid Now
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}