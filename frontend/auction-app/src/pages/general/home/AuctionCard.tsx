// src/pages/home/AuctionCard.tsx
interface AuctionItem {
    id: string;
    title: string;
    currentBid: number;
    timeLeft: string;
    image: string;
    bidsCount: number;
}

interface AuctionCardProps {
    item: AuctionItem;
    isCurrent?: boolean;
}

export default function AuctionCard({ item, isCurrent = false }: AuctionCardProps) {
    return (
        // Uniform fixed size so it transitions fluidly without browser reflow glitches
        <div className="w-[280px] h-[400px] bg-white border border-neutral-200/80 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between">
            {/* Image section */}
            <div className="relative w-full h-[180px] bg-neutral-100 flex items-center justify-center overflow-hidden">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80`;
                    }}
                />
                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                    Live
                </div>
            </div>

            {/* Content section */}
            <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                <div>
                    <h3 className="font-bold text-[#0D0D0D] text-sm line-clamp-2 transition-all duration-300">
                        {item.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">{item.bidsCount} bids placed</p>
                </div>

                <div className="space-y-3 mt-2">
                    <div className="flex justify-between items-end border-t border-neutral-100 pt-3">
                        <div>
                            <span className="text-[10px] block uppercase text-neutral-400 font-medium tracking-wide">Current Bid</span>
                            <span className="font-extrabold text-[#0D0D0D] text-base tabular-nums">
                                ${item.currentBid.toLocaleString()}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] block uppercase text-neutral-400 font-medium tracking-wide">Ends In</span>
                            <span className="text-xs font-semibold text-[#F5C518] tabular-nums">
                                {item.timeLeft}
                            </span>
                        </div>
                    </div>

                    {/* Smooth height/opacity fade for the Action button */}
                    <div className={`transition-all duration-500 overflow-hidden ${isCurrent ? 'h-10 opacity-100' : 'h-0 opacity-0 pointer-events-none'}`}>
                        <button className="w-full h-full bg-[#0D0D0D] hover:bg-[#F5C518] text-white hover:text-[#0D0D0D] font-bold text-xs rounded-lg transition-colors duration-200 uppercase tracking-wider">
                            Place Bid
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export type { AuctionItem };