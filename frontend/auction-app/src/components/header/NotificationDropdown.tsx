import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CheckCheck } from 'lucide-react';
import NotificationItem from '../../pages/user/user/notification/NotificationItem';

export interface NotificationPreview {
    id: number;
    message: string;
    sendAt: string; // ISO string
    read?: boolean;
}

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: NotificationPreview[];
    isLoading?: boolean;
    onMarkAllRead?: () => void;
}

export default function NotificationDropdown({
    isOpen,
    onClose,
    notifications,
    isLoading = false,
    onMarkAllRead,
}: NotificationDropdownProps) {
    const navigate = useNavigate();
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, onClose]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    const handleViewAll = () => {
        navigate('/account/notifications');
        onClose();
    };

    return (
        <div
            ref={ref}
            role="dialog"
            aria-label="Notifications"
            className={`
                absolute top-[calc(100%+8px)] right-0 w-[360px] bg-white border border-[#0D0D0D] rounded-xl shadow-[4px_4px_0px_#0D0D0D]
                overflow-hidden z-[200] transition-all duration-200 origin-top-right
                ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                    <Bell size={14} strokeWidth={2.5} className="text-[#0D0D0D]" />
                    <span className="text-[13px] font-black tracking-tight text-[#0D0D0D] uppercase">
                        Notifications
                    </span>
                </div>
                {onMarkAllRead && notifications.some(n => !n.read) && (
                    <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-[#0D0D0D] transition-colors cursor-pointer bg-transparent border-0 p-0"
                    >
                        <CheckCheck size={12} />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="max-h-[320px] overflow-y-auto overscroll-contain">
                {isLoading ? (
                    <div className="flex flex-col divide-y divide-neutral-50">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <DropdownSkeleton key={i} />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-neutral-300">
                        <Bell size={28} strokeWidth={1.5} />
                        <p className="text-[12px] font-semibold tracking-wide">You're all caught up</p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-neutral-50">
                        {notifications.slice(0, 8).map(n => (
                            <NotificationItem
                                key={n.id}
                                message={n.message}
                                sendAt={n.sendAt}
                                read={n.read}
                                compact
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {!isLoading && notifications.length > 0 && (
                <div className="border-t border-neutral-100 px-4 py-2.5">
                    <button
                        type="button"
                        onClick={handleViewAll}
                        className="
                            w-full flex items-center justify-center gap-1.5
                            text-[12px] font-bold text-[#0D0D0D] hover:text-[#F5C518]
                            transition-colors cursor-pointer bg-transparent border-0 p-0
                        "
                    >
                        View all notifications
                        <ArrowRight size={12} strokeWidth={2.5} />
                    </button>
                </div>
            )}
        </div>
    );
}

function DropdownSkeleton() {
    return (
        <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-neutral-100 mt-1.5 flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-3 bg-neutral-100 rounded w-[85%]" />
                <div className="h-3 bg-neutral-100 rounded w-[60%]" />
                <div className="h-2.5 bg-neutral-100 rounded w-[30%] mt-0.5" />
            </div>
        </div>
    );
}