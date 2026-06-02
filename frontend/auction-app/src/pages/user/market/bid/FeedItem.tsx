import { Clock } from 'lucide-react';
import type { BidFeedEvent } from '../../../../types/bid';

interface FeedItemProps {
    event: BidFeedEvent;
    isNew?: boolean;
}

function formatPrice(val: string | number) {
    const n = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(n)) return val;
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function formatTime(isoString: string) {
    try {
        const d = new Date(isoString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
        return '';
    }
}

export default function FeedItem({ event, isNew }: FeedItemProps) {
    return (
        <div className={`flex items-center justify-between p-3 rounded-xl border mb-2 transition-all duration-500 ${
            isNew ? 'bg-[#F5C518]/10 border-[#F5C518]/30 scale-[1.02]' : 'bg-white border-neutral-100 hover:border-neutral-200'
        }`}>
            <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-bold text-[#0D0D0D]">
                    {event.bidderLabel}
                </span>
                <div className="flex items-center gap-1 text-neutral-400">
                    <Clock size={10} />
                    <span className="text-[10px]">{formatTime(event.placedAt)}</span>
                </div>
            </div>
            <div className="text-[14px] font-black text-[#0D0D0D]">
                {formatPrice(event.amount)}
            </div>
        </div>
    );
}
