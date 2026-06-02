import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CheckCheck } from 'lucide-react';
import NotificationItem from '../../pages/user/user/notification/NotificationItem';
import { theme } from '../../constants/theme';

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
    onToggleRead?: (id: number, currentReadStatus: boolean) => void;
}

export default function NotificationDropdown({
    isOpen,
    onClose,
    notifications,
    isLoading = false,
    onMarkAllRead,
    onToggleRead,
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
                absolute top-[calc(100%+8px)] right-0 w-[360px] border rounded-xl 
                overflow-hidden z-[200] transition-all duration-200 origin-top-right
                ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
            `}
            style={{ 
                backgroundColor: theme.colors.surface, 
                borderColor: theme.colors.primary, 
                boxShadow: theme.shadows.dropdown 
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: theme.colors.border }}>
                <div className="flex items-center gap-2">
                    <Bell size={14} strokeWidth={2.5} style={{ color: theme.colors.primary }} />
                    <span className="text-[13px] tracking-tight uppercase" style={{ color: theme.colors.primary, fontWeight: theme.typography.fontWeight.black }}>
                        Notifications
                    </span>
                </div>
                {onMarkAllRead && notifications.some(n => !n.read) && (
                    <button
                        type="button"
                        onClick={onMarkAllRead}
                        className="flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer bg-transparent border-0 p-0 hover:opacity-75"
                        style={{ color: theme.colors.text.muted }}
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
                    <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ color: theme.colors.text.muted }}>
                        <Bell size={28} strokeWidth={1.5} />
                        <p className="text-[12px]" style={{ fontWeight: theme.typography.fontWeight.semibold }}>You're all caught up</p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-neutral-50">
                        {notifications.slice(0, 8).map(n => (
                            <NotificationItem
                                key={n.id}
                                id={n.id}
                                message={n.message}
                                sendAt={n.sendAt}
                                read={n.read}
                                compact
                                onToggleRead={() => onToggleRead?.(n.id, !!n.read)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {!isLoading && notifications.length > 0 && (
                <div className="border-t px-4 py-2.5" style={{ borderColor: theme.colors.border }}>
                    <button
                        type="button"
                        onClick={handleViewAll}
                        className="
                            w-full flex items-center justify-center gap-1.5
                            text-[12px] transition-colors cursor-pointer bg-transparent border-0 p-0
                            hover:opacity-75
                        "
                        style={{ color: theme.colors.primary, fontWeight: theme.typography.fontWeight.bold }}
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