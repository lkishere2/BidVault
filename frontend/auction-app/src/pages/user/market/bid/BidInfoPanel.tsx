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

function BidInfoBox({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
    return (
        <div className="bg-neutral-50 rounded-2xl p-3 sm:p-4 text-center flex flex-col justify-center items-center shadow-sm border border-neutral-100 overflow-hidden w-full transition-colors hover:bg-neutral-100/50">
            <p className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-center justify-center gap-1.5 w-full">
                {icon}
                <p className="text-[16px] sm:text-[18px] md:text-[20px] font-black text-[#0D0D0D] break-words">
                    {value}
                </p>
            </div>
        </div>
    );
}

export default function BidInfoPanel({ auction, ticker, onPlaceBid }: BidInfoPanelProps) {
    const currentPrice = ticker ? ticker.currentPrice : auction.currentPrice;
    const bidCount = ticker ? ticker.bidCount : auction.bidCount;
    const endTime = ticker ? ticker.endTime : auction.endTime;
    const minBidIncrement = ticker
        ? (parseFloat(ticker.minNextBid) - parseFloat(ticker.currentPrice)).toString()
        : auction.minBidIncrement;
    const isEnded = ticker ? ticker.ended : auction.status === 'ENDED';
    const isExtended = ticker ? ticker.extended : auction.extended;
    const topBidder = ticker ? ticker.bidderLabel : auction.winnerLabel;

    const [timeLeft, setTimeLeft] = useState<string>('');
    const [bidAmount, setBidAmount] = useState<string>('');

    // Pre-fill next minimum bid when minBidIncrement changes
    useEffect(() => {
        const nextMin = parseFloat(currentPrice) + parseFloat(minBidIncrement);
        if (!isNaN(nextMin)) {
            const roundedAmount = Math.round(nextMin + 1);
            setBidAmount(roundedAmount.toString());
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
        <div className="flex flex-col h-full bg-white p-6 md:p-8 flex-1">
            <div className="flex gap-5 mb-8">
                {auction.productImageUrl ? (
                    <img
                        src={auction.productImageUrl}
                        alt={auction.productName}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover flex-shrink-0 border border-neutral-200 shadow-sm"
                    />
                ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-neutral-100 flex items-center justify-center flex-shrink-0 border border-neutral-200 shadow-sm">
                        <Gavel size={32} className="text-neutral-400" strokeWidth={1.5} />
                    </div>
                )}
                <div className="min-w-0 flex flex-col justify-center">
                    <p className="text-[12px] sm:text-[13px] md:text-[14px] text-neutral-500 font-bold uppercase tracking-wide truncate">{auction.sellerLabel}</p>
                    <h3 className="text-[18px] sm:text-[22px] md:text-[26px] font-black text-[#0D0D0D] leading-snug mt-1 line-clamp-2">
                        {auction.productName}
                    </h3>
                    {!isEnded && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            LIVE
                        </span>
                    )}
                    {isEnded && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold w-max">
                            ENDED
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <BidInfoBox label="Current Bid" value={formatPrice(currentPrice)} />
                <BidInfoBox label="Min Increment" value={formatPrice(minBidIncrement)} />
                <BidInfoBox label="Bids" value={bidCount} icon={<Users size={14} className="text-neutral-400 hidden sm:block" />} />
                <BidInfoBox label="Top Bidder" value={topBidder || 'None'} />
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 text-neutral-500 mb-6 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <Clock size={16} className="text-neutral-400" />
                <p className="text-[14px] font-bold text-neutral-600">
                    {isEnded ? 'Auction ended' : `Ends in ${timeLeft}`}
                </p>
                {isExtended && (
                    <span className="ml-auto text-[10px] font-bold text-[#F5C518] bg-[#F5C518]/10 px-2 py-0.5 rounded-full border border-[#F5C518]/30">
                        EXTENDED
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 mt-auto">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-[16px] sm:text-[18px]">$</span>
                    <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        disabled={isEnded}
                        placeholder="Enter amount"
                        className="w-full h-[50px] sm:h-[56px] rounded-2xl border border-neutral-200 bg-white pl-9 pr-4 text-[16px] sm:text-[18px] font-bold text-[#0D0D0D] outline-none focus:border-[#F5C518] focus:ring-4 focus:ring-[#F5C518]/10 transition-all disabled:bg-neutral-50 disabled:text-neutral-400 shadow-sm"
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
                    className={`w-full h-[50px] sm:h-[56px] rounded-2xl text-[15px] sm:text-[16px] font-black flex items-center justify-center gap-2 transition-all shadow-md ${isEnded || !bidAmount
                        ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none'
                        : 'bg-[#F5C518] text-[#0D0D0D] hover:bg-[#e0b416] hover:shadow-lg hover:shadow-[#F5C518]/20 cursor-pointer transform hover:-translate-y-0.5'
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
