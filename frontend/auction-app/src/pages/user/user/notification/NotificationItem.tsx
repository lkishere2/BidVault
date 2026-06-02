import { Gavel, UserPlus } from 'lucide-react';

interface NotificationItemProps {
    message: string;
    sendAt: string; // ISO string
    read?: boolean;
    compact?: boolean; // true = dropdown style, false = full page style
}

function getIcon(message: string) {
    if (message.toLowerCase().includes('auction')) {
        return <Gavel size={14} strokeWidth={2} className="text-[#F5C518]" />;
    }
    return <UserPlus size={14} strokeWidth={2} className="text-[#0D0D0D]" />;
}

function timeAgo(iso: string) {
    try {
        const diff = Date.now() - new Date(iso).getTime();
        const s = Math.floor(diff / 1000);
        if (s < 60) return 'just now';
        const m = Math.floor(s / 60);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        const d = Math.floor(h / 24);
        if (d < 30) return `${d}d ago`;
        const mo = Math.floor(d / 30);
        if (mo < 12) return `${mo}mo ago`;
        return `${Math.floor(mo / 12)}y ago`;
    } catch {
        return '';
    }
}

export default function NotificationItem({ message, sendAt, read = true, compact = false }: NotificationItemProps) {
    if (compact) {
        return (
            <div className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 ${!read ? 'bg-[#FFFBEB]' : ''}`}>
                {/* Unread dot */}
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!read ? 'bg-[#F5C518]' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                    <p className={`text-[12.5px] leading-snug text-[#0D0D0D] ${!read ? 'font-semibold' : 'font-normal'}`}>
                        {message}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{timeAgo(sendAt)}</p>
                </div>
            </div>
        );
    }

    // Full page variant
    return (
        <div
            className={`
                flex items-start gap-4 px-5 py-4 rounded-xl border transition-all
                ${!read
                    ? 'bg-[#FFFBEB] border-[#F5C518]/40 shadow-[2px_2px_0px_#F5C518]'
                    : 'bg-white border-neutral-100 hover:border-neutral-200'
                }
            `}
        >
            {/* Icon */}
            <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                ${!read ? 'bg-[#F5C518]/15 border border-[#F5C518]/30' : 'bg-neutral-50 border border-neutral-100'}
            `}>
                {getIcon(message)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={`text-[13.5px] leading-snug text-[#0D0D0D] ${!read ? 'font-semibold' : 'font-normal'}`}>
                    {message}
                </p>
                <p className="text-[11.5px] text-neutral-400 mt-1">{timeAgo(sendAt)}</p>
            </div>

            {/* Unread indicator */}
            {!read && (
                <span className="w-2 h-2 rounded-full bg-[#F5C518] flex-shrink-0 mt-1.5" />
            )}
        </div>
    );
}