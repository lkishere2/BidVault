import type { RefObject } from 'react';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';
import type { Notification } from '../../../../types/notification';

interface NotificationGridProps {
    items: Notification[];
    isLoadingMore?: boolean;
    onToggleRead: (id: number, currentReadStatus: boolean) => void;
    sentinelRef?: RefObject<HTMLDivElement | null>;
    hasNext?: boolean;
}

export default function NotificationGrid({
    items,
    isLoadingMore = false,
    onToggleRead,
    sentinelRef,
    hasNext = false,
}: NotificationGridProps) {
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map(n => (
                    <NotificationItem
                        key={n.id}
                        notificationId={n.id}
                        message={n.message}
                        sendAt={n.sendAt}
                        read={n.read}
                        onToggleRead={() => onToggleRead(n.id, !!n.read)}
                    />
                ))}
            </div>

            <div ref={sentinelRef} className="h-4" />

            {isLoadingMore && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    <NotificationSkeleton count={4} />
                </div>
            )}

            {!hasNext && items.length > 0 && (
                <p className="text-center text-[11px] font-semibold text-neutral-300 py-4 tracking-wide uppercase">
                    You've reached the end
                </p>
            )}
        </>
    );
}