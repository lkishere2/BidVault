import type { AuctionLot } from './PreviewSection';
import { useNavigate } from 'react-router-dom';

interface PreviewItemProps {
    item: AuctionLot;
}

export default function PreviewItem({ item }: PreviewItemProps) {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate(`/auctions/hub/${item.id}`)}
            className="group bg-white border border-neutral-200 rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-[#F5C518]/50 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]"
        >
            <div className="relative overflow-hidden">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full aspect-[4/3] object-cover block transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80';
                    }}
                    loading="lazy"
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-red-600 text-white text-[9px] font-extrabold tracking-[.1em] uppercase rounded px-2 py-1">
                    <span className="w-[5px] h-[5px] rounded-full bg-white animate-pulse" />
                    Live
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col gap-2">
                <span className="text-[10px] font-bold tracking-[.12em] uppercase text-[#F5C518]">
                    {item.category}
                </span>
                <p className="text-[13px] font-bold text-[#0D0D0D] leading-[1.4] line-clamp-2 flex-1">
                    {item.title}
                </p>
                <div className="flex justify-between items-end border-t border-neutral-100 pt-3 mt-1">
                    <div>
                        <span className="block text-[9px] font-bold tracking-[.1em] uppercase text-neutral-400 mb-1">
                            Current bid
                        </span>
                        <span className="text-[15px] font-extrabold text-[#0D0D0D] tabular-nums">
                            ${item.currentBid.toLocaleString()}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="block text-[9px] font-bold tracking-[.1em] uppercase text-neutral-400 mb-1">
                            Ends in
                        </span>
                        <span className="text-[11px] font-bold text-[#F5C518]">
                            {item.timeLeft}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}