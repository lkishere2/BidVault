import { Gavel, Users, Clock, ArrowUpRight } from 'lucide-react';
import type { AuctionResponse } from '../../../../types/auction';
import type { BidNotificationPayload } from '../../../../types/bid';
import { useEffect, useState } from 'react';

interface BidInfoPanelProps {
    auction: AuctionResponse;
    ticker: BidNotificationPayload | null;
    onPlaceBid: (amount: string) => void;
}

function formatPrice(val: string | number) {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(n)) return val;
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function BidInfoPanel({ auction, ticker, onPlaceBid }: BidInfoPanelProps) {
    const currentPrice = ticker ? ticker.currentPrice : auction.currentPrice;
    const bidCount = ticker ? ticker.bidCount : auction.bidCount;
    const endTime = ticker ? ticker.endTime : auction.endTime;
    const minBidIncrement = ticker ? ticker.minNextBid : auction.minBidIncrement;
    const isEnded = ticker ? ticker.ended : auction.status === 'ENDED';
    const isExtended = ticker ? ticker.extended : auction.extended;
    const topBidder = ticker ? ticker.bidderLabel : auction.winnerLabel;

    const [timeLeft, setTimeLeft] = useState<string>('');
    const [bidAmount, setBidAmount] = useState<string>('');

    // Pre-fill next minimum bid when minBidIncrement changes
    useEffect(() => {
        const nextMin = parseFloat(currentPrice) + parseFloat(minBidIncrement);
        if (!isNaN(nextMin)) {
            setBidAmount(nextMin.toString());
        }
    }, [currentPrice, minBidIncrement]);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const end = new Date(endTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) return 'Ended';

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) return `${days}d ${hours}h`;
            if (hours > 0) return `${hours}h ${minutes}m`;
            return `${minutes}m ${seconds}s`;
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className="flex flex-col h-full bg-white p-5">
            <div className="flex gap-4 mb-5">
                {auction.productImageUrl ? (
                    <img
                        src={auction.productImageUrl}
                        alt={auction.productName}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-neutral-100"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                        <Gavel size={24} className="text-neutral-300" strokeWidth={1.5} />
                    </div>
                )}
                <div className="min-w-0">
                    <p className="text-[12px] text-neutral-400 font-medium truncate">{auction.sellerLabel}</p>
                    <h3 className="text-[15px] font-bold text-[#0D0D0D] leading-snug mt-0.5 line-clamp-2">
                        {auction.productName}
                    </h3>
                    {!isEnded && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            LIVE
                        </span>
                    )}
                    {isEnded && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold">
                            ENDED
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-neutral-50 rounded-xl p-3 text-center flex flex-col justify-center items-center">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Current Bid</p>
                    <p className="text-[15px] font-black text-[#0D0D0D]">{formatPrice(currentPrice)}</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 text-center flex flex-col justify-center items-center">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Min Increment</p>
                    <p className="text-[15px] font-black text-[#0D0D0D]">{formatPrice(minBidIncrement)}</p>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 text-center flex flex-col justify-center items-center">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Bids</p>
                    <div className="flex items-center justify-center gap-1">
                        <Users size={11} className="text-neutral-400" />
                        <p className="text-[15px] font-black text-[#0D0D0D]">{bidCount}</p>
                    </div>
                </div>
                <div className="bg-neutral-50 rounded-xl p-3 text-center flex flex-col justify-center items-center overflow-hidden">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Top Bidder</p>
                    <p className="text-[15px] font-black text-[#0D0D0D] truncate w-full px-1">
                        {topBidder || 'None'}
                    </p>
                </div>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 text-neutral-400 mb-5">
                <Clock size={11} />
                <p className="text-[12px] font-medium text-neutral-600">
                    {isEnded ? 'Auction ended' : `Ends in ${timeLeft}`}
                </p>
                {isExtended && (
                    <span className="ml-auto text-[10px] font-bold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                        EXTENDED
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                    <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        disabled={isEnded}
                        placeholder="Enter amount"
                        className="w-full h-[48px] rounded-xl border border-neutral-200 pl-8 pr-4 text-[15px] font-bold text-[#0D0D0D] outline-none focus:border-[#F5C518] focus:ring-2 focus:ring-[#F5C518]/20 transition-all disabled:bg-neutral-50 disabled:text-neutral-400"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (!isEnded && bidAmount) {
                            onPlaceBid(bidAmount);
                        }
                    }}
                    disabled={isEnded || !bidAmount}
                    className={`w-full h-[48px] rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all ${isEnded || !bidAmount
                        ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        : 'bg-[#0D0D0D] text-white hover:bg-[#1A1A1A] cursor-pointer'
                        }`}
                >
                    <Gavel size={16} strokeWidth={2} />
                    {isEnded ? 'Auction Ended' : 'Place Bid'}
                    {!isEnded && <ArrowUpRight size={14} strokeWidth={2} />}
                </button>
            </div>
        </div>
    );
}
