import { X, Gavel, Clock, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import type { AuctionResponse } from '../../../../types/auction';

interface BidSectionProps {
    auction: AuctionResponse;
    onClose: () => void;
}

function formatPrice(val: string) {
    const n = parseFloat(val);
    if (isNaN(n)) return val;
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function BidSection({ auction, onClose }: BidSectionProps) {
    return (
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl animate-slide-up">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                        <Gavel size={16} className="text-[#F5C518]" strokeWidth={2.5} />
                        <span className="text-[15px] font-bold text-[#0D0D0D]">Place a Bid</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600 transition-colors cursor-pointer bg-white"
                    >
                        <X size={14} strokeWidth={2} />
                    </button>
                </div>

                <div className="p-5">
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
                            {auction.status === 'ACTIVE' && (
                                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    LIVE
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="bg-neutral-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Current Bid</p>
                            <p className="text-[15px] font-black text-[#0D0D0D]">{formatPrice(auction.currentPrice)}</p>
                        </div>
                        <div className="bg-neutral-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Min Increment</p>
                            <p className="text-[15px] font-black text-[#0D0D0D]">{formatPrice(auction.minBidIncrement)}</p>
                        </div>
                        <div className="bg-neutral-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Bids</p>
                            <div className="flex items-center justify-center gap-1">
                                <Users size={11} className="text-neutral-400" />
                                <p className="text-[15px] font-black text-[#0D0D0D]">{auction.bidCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border-2 border-dashed border-[#F5C518]/40 bg-[#F5C518]/5 p-8 flex flex-col items-center justify-center gap-2 mb-5">
                        <div className="w-10 h-10 rounded-full bg-[#F5C518]/20 flex items-center justify-center mb-1">
                            <TrendingUp size={20} className="text-[#F5C518]" strokeWidth={2} />
                        </div>
                        <p className="text-[14px] font-bold text-[#0D0D0D]">Bidding Coming Soon</p>
                        <p className="text-[12px] text-neutral-500 text-center leading-relaxed">
                            The live bidding interface is under construction. Check back shortly!
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-neutral-400">
                        <Clock size={11} />
                        <p className="text-[11px]">
                            Ends {new Date(auction.endTime).toLocaleString()}
                        </p>
                        {auction.extended && (
                            <span className="ml-auto text-[10px] font-bold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                                EXTENDED
                            </span>
                        )}
                    </div>
                </div>

                <div className="px-5 pb-5">
                    <button
                        type="button"
                        disabled
                        className="w-full h-[48px] rounded-xl bg-[#0D0D0D] text-white text-[14px] font-bold flex items-center justify-center gap-2 opacity-40 cursor-not-allowed"
                    >
                        <Gavel size={16} strokeWidth={2} />
                        Place Bid
                        <ArrowUpRight size={14} strokeWidth={2} />
                    </button>
                </div>
            </div>
        </div>
    );
}