import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import type { BidFeedEvent } from '../../../../types/bid';
import { Activity } from 'lucide-react';

interface BidLineChartProps {
    bids: BidFeedEvent[];
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
}

export default function BidLineChart({ bids, onLoadMore, hasMore, isLoadingMore }: BidLineChartProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(400);
    const prevBidsLengthRef = useRef(bids.length);
    const isFetchingRef = useRef(false);

    const chartData = [...bids].reverse().map(b => ({
        time: new Date(b.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        amount: parseFloat(b.amount) || 0,
        bidder: b.bidderLabel || 'Unknown'
    }));

    const ITEM_WIDTH = 80;
    const dynamicWidth = Math.max(800, chartData.length * ITEM_WIDTH);

    useEffect(() => {
        const updateHeight = () => {
            if (wrapperRef.current) {
                setContainerHeight(wrapperRef.current.clientHeight);
            }
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    useEffect(() => {
        if (scrollContainerRef.current && prevBidsLengthRef.current === 0 && bids.length > 0) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
            // Also scroll to bottom initially so the latest low values are in view if it's tall
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [bids.length]);

    useLayoutEffect(() => {
        if (!scrollContainerRef.current) return;
        const lengthDiff = bids.length - prevBidsLengthRef.current;
        
        if (lengthDiff > 1 && isFetchingRef.current) {
            scrollContainerRef.current.scrollLeft += lengthDiff * ITEM_WIDTH;
            isFetchingRef.current = false;
        } else if (lengthDiff === 1) {
            const container = scrollContainerRef.current;
            const isNearRightEdge = container.scrollWidth - container.scrollLeft - container.clientWidth < 100;
            if (isNearRightEdge) {
                setTimeout(() => { container.scrollLeft = container.scrollWidth; }, 100);
            }
        }
        prevBidsLengthRef.current = bids.length;
    }, [bids.length]);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        if (scrollContainerRef.current.scrollLeft === 0 && hasMore && !isLoadingMore && onLoadMore) {
            isFetchingRef.current = true;
            onLoadMore();
        }
    };

    let pathD = '';
    let minAmount = Math.min(...chartData.map(d => d.amount));
    let maxAmount = Math.max(...chartData.map(d => d.amount));
    
    // Prevent division by zero if all amounts are identical
    if (minAmount === maxAmount) {
        minAmount -= 10;
        maxAmount += 10;
    }
    const range = maxAmount - minAmount;

    const PADDING_TOP = 40;
    const PADDING_BOTTOM = 40;
    // Set a large dynamic height for vertical scrolling (800px minimum)
    const dynamicHeight = Math.max(800, containerHeight);
    const drawHeight = Math.max(100, dynamicHeight - PADDING_TOP - PADDING_BOTTOM);

    const points = chartData.map((data, index) => {
        const x = (index * ITEM_WIDTH) + (ITEM_WIDTH / 2);
        // Map Y inverted (since SVG 0 is at the top)
        const y = dynamicHeight - PADDING_BOTTOM - ((data.amount - minAmount) / range) * drawHeight;
        return { x, y, data };
    });

    if (points.length > 0) {
        pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    }

    // Generate Y-axis steps (e.g. 10 steps for more granular values)
    const numSteps = 8;
    const ySteps = Array.from({ length: numSteps + 1 }).map((_, i) => {
        return minAmount + (range * (i / numSteps));
    }).reverse(); // highest to lowest

    return (
        <div ref={wrapperRef} className="flex flex-col w-full h-full min-h-[400px] relative bg-white rounded-xl border border-neutral-200 overflow-hidden">
            {isLoadingMore && (
                <div className="absolute top-2 left-2 z-30 bg-white/80 backdrop-blur-sm border border-neutral-200 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                    <Activity size={12} className="text-[#F5C518] animate-spin" />
                    <span className="text-[10px] font-bold text-neutral-600">Loading history...</span>
                </div>
            )}
            
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="w-full h-full overflow-auto custom-scrollbar flex relative"
            >
                {/* Sticky Y-Axis Overlay inside scroll container */}
                <div 
                    className="sticky left-0 top-0 z-20 w-16 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none flex flex-col justify-between shrink-0"
                    style={{ height: dynamicHeight, paddingTop: PADDING_TOP - 6, paddingBottom: PADDING_BOTTOM - 6 }}
                >
                    {ySteps.map((val, i) => (
                        <span key={i} className="text-[10px] font-bold text-neutral-500 px-2 opacity-80">
                            ${val.toFixed(0)}
                        </span>
                    ))}
                </div>

                {/* Main Chart Canvas */}
                <div style={{ width: dynamicWidth, height: dynamicHeight, marginLeft: -64 }} className="shrink-0">
                    <svg width={dynamicWidth} height={dynamicHeight}>
                        {/* Horizontal Grid lines mapped perfectly to steps */}
                        {ySteps.map((_, i) => {
                            const y = PADDING_TOP + (i / numSteps) * drawHeight;
                            return (
                                <line 
                                    key={i} 
                                    x1="0" 
                                    y1={y} 
                                    x2={dynamicWidth} 
                                    y2={y} 
                                    stroke="#f0f0f0" 
                                    strokeWidth="1" 
                                    strokeDasharray={i > 0 && i < numSteps ? "4 4" : "0"} 
                                />
                            );
                        })}
                        
                        {/* Line Path */}
                        <path d={pathD} fill="none" stroke="#F5C518" strokeWidth="3" strokeLinejoin="round" />
                        
                        {/* Data Points and Tooltips */}
                        {points.map((p, i) => (
                            <g key={i} className="group cursor-pointer">
                                {/* Invisible larger circle for easier hover area */}
                                <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
                                
                                {/* Visible Dot */}
                                <circle cx={p.x} cy={p.y} r="4" fill="#0D0D0D" stroke="#F5C518" strokeWidth="2" className="transition-all duration-200 group-hover:r-5 group-hover:fill-[#F5C518]" />
                                
                                {/* X-Axis Time Label */}
                                <text x={p.x} y={dynamicHeight - 15} fontSize="10" fill="#888" textAnchor="middle">
                                    {p.data.time}
                                </text>
                                
                                {/* Tooltip (Shows on Hover) */}
                                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                    <rect x={p.x - 40} y={p.y - 45} width="80" height="35" rx="6" fill="#0D0D0D" />
                                    <text x={p.x} y={p.y - 30} fontSize="11" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">
                                        ${p.data.amount}
                                    </text>
                                    <text x={p.x} y={p.y - 18} fontSize="9" fill="#A3A3A3" textAnchor="middle">
                                        {p.data.bidder}
                                    </text>
                                </g>
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
        </div>
    );
}
