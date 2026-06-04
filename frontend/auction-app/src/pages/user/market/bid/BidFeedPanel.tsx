import { Activity, List, LineChart } from 'lucide-react';
import type { BidFeedEvent } from '../../../../types/bid';
import FeedItem from './FeedItem';
import BidLineChart from './BidLineChart';
import { useEffect, useRef, useState } from 'react';

interface BidFeedPanelProps {
    bids: BidFeedEvent[];
    isConnected: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
}

export default function BidFeedPanel({ bids, isConnected, onLoadMore, hasMore, isLoadingMore }: BidFeedPanelProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

    // Auto-scroll to top as new bids arrive in list mode
    useEffect(() => {
        if (viewMode === 'list' && scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [bids, viewMode]);

    return (
        <div className="flex flex-col h-full bg-neutral-50/50 border-l border-neutral-200">
            <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-200 bg-white">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className={isConnected ? "text-emerald-500" : "text-neutral-400"} />
                        <h3 className="text-[14px] font-bold text-[#0D0D0D]">Live Feed</h3>
                    </div>
                    {isConnected ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            CONNECTED
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full border border-neutral-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            OFFLINE
                        </span>
                    )}
                </div>

                <div className="flex bg-neutral-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#0D0D0D]' : 'text-neutral-500 hover:text-neutral-700'}`}
                        title="List View"
                    >
                        <List size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('chart')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'chart' ? 'bg-white shadow-sm text-[#0D0D0D]' : 'text-neutral-500 hover:text-neutral-700'}`}
                        title="Chart View"
                    >
                        <LineChart size={16} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 scroll-smooth"
            >
                {bids.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-2">
                        <Activity size={24} className="opacity-20" />
                        <p className="text-[12px]">No bids yet. Be the first!</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <div className="flex flex-col gap-2">
                                {bids.map((bid, index) => (
                                    <FeedItem
                                        key={`${bid.bidId ?? index}-${bid.placedAt}-${bid.amount}-${bid.bidderLabel}`}
                                        event={bid}
                                        isNew={index === 0}
                                    />
                                ))}
                            </div>
                        ) : (
                            <BidLineChart 
                                bids={bids} 
                                onLoadMore={onLoadMore} 
                                hasMore={hasMore} 
                                isLoadingMore={isLoadingMore} 
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
